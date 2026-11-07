from sqlalchemy.orm import Session
from backend.app.models.evaluation import Evaluation

def create_evaluation_record(
    db: Session,
    question: str,
    generated_answer: str,
    evaluation_result: dict,
    expected_answer: str | None = None,
    evaluated_by: int | None = None
) -> Evaluation:
    # Save RAG evaluation results in the database.
    evaluation = Evaluation(
        question = question,
        generated_answer = generated_answer,
        expected_answer = expected_answer,
        metrics = {
            "retrieval": evaluation_result["retrieval"],
            "generation": evaluation_result["generation"],
            "details": evaluation_result["details"]
        },
        overall_score = None,
        status = "completed",
        evaluated_by = evaluated_by
    )
    
    try:
        db.add(evaluation)
        db.commit()
        db.refresh(evaluation)
        
        return evaluation
    except Exception:
        db.rollback()
        raise

def get_evaluation(
    db: Session,
    evaluation_id: int,
) -> Evaluation | None:

    return (
        db.query(Evaluation)
        .filter(Evaluation.id == evaluation_id)
        .first()
    )


def list_evaluations(
    db: Session,
    skip: int = 0,
    limit: int = 20,
) -> list[Evaluation]:

    return (
        db.query(Evaluation)
        .order_by(Evaluation.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )