from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

import logging

from backend.app.auth.permissions import require_roles
from backend.app.auth.roles import UserRole
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.schemas.evaluation import (
    EvaluationCreate,
    EvaluationResponse
)
from backend.app.services.evaluation_service import(
    create_evaluation_record,
    get_evaluation,
    list_evaluations
)
from backend.app.evaluation.evaluator import evaluate_rag_pipeline
from backend.app.api.v1.chat import get_rag_pipeline

router = APIRouter(prefix = "/evaluation", tags = ["Evaluation"])
logger = logging.getLogger(__name__)

@router.post(
    "/run",
    response_model = EvaluationResponse,
    status_code = status.HTTP_201_CREATED
)
def run_evaluation(
    request: EvaluationCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[
        User,
        Depends(require_roles(UserRole.ADMIN))
    ]
) -> EvaluationResponse:
    try:
        pipeline = get_rag_pipeline()
        
        result = pipeline.run(
            question = request.question,
            include_documents = True
        )
        
        documents = result["retrieved_documents"]
        
        evaluation_result = evaluate_rag_pipeline(
            question = request.question,
            answer = result["answer"],
            retrieved_documents = documents,
            relevant_chunk_ids = request.relevant_chunk_ids,
            llm = pipeline.generator.llm,
            grounding_result = result.get("grounding_results")
        )
        
        evaluation = create_evaluation_record(
            db = db,
            question = request.question,
            generated_answer = result["answer"],
            expected_answer = request.expected_answer,
            evaluation_result = evaluation_result,
            evaluated_by = current_user.id
        )
        
        return EvaluationResponse.model_validate(evaluation)
    except ValueError as exc:
        raise HTTPException(
            status_code = status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail = str(exc)
        ) from exc
    
    except Exception as exc:
        logger.exception("Evaluation API failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Evaluation failed. Please check the server logs.",
        ) from exc

@router.get("", response_model=list[EvaluationResponse])
def get_evaluation_history(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[
        User,
        Depends(require_roles(UserRole.ADMIN))
    ],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    return list_evaluations(
        db=db,
        skip=skip,
        limit=limit,
    )


@router.get("/{evaluation_id}", response_model=EvaluationResponse)
def get_evaluation_details(
    evaluation_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[
        User,
        Depends(require_roles(UserRole.ADMIN))
    ],
):
    evaluation = get_evaluation(
        db=db,
        evaluation_id=evaluation_id,
    )

    if evaluation is None:
        raise HTTPException(
            status_code=404,
            detail="Evaluation not found",
        )

    return evaluation