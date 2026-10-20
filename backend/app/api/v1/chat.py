
from functools import lru_cache
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.auth.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.rag.pipeline import RAGPipeline
from backend.app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["Chat"])


@lru_cache(maxsize=1)
def get_rag_pipeline() -> RAGPipeline:
    """Reuse one RAG pipeline instance within this process."""
    return RAGPipeline()


@router.post("", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    current_user: Annotated[User, Depends(get_current_user)],
) -> ChatResponse:
    """Answer an authenticated user's question using RAG."""
    try:
        pipeline = get_rag_pipeline()
        result = pipeline.run(
            question=request.question,
            conversation_history=request.conversation_history,
            top_k=request.top_k,
            candidate_k=request.candidate_k,
            document_type=request.document_type,
            file_name=request.file_name,
        )

        return ChatResponse(**result)

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(exc),
        ) from exc
