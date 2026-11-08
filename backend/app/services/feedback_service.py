from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.feedback import Feedback
from backend.app.models.message import Message
from backend.app.models.conversation import Conversation


def submit_or_update_feedback(
    db: Session,
    user_id: int,
    message_id: int,
    rating: str,
    comment: str | None = None,
) -> Feedback:
    """
    Submit new feedback or update existing feedback
    for an assistant message.
    """

    try:
        # 1. Verify message ownership and role
        statement = (
            select(Message)
            .join(Conversation)
            .where(
                Message.id == message_id,
                Message.role == "assistant",
                Conversation.user_id == user_id,
            )
        )

        message = db.execute(statement).scalar_one_or_none()

        if message is None:
            raise ValueError(
                "Assistant message not found or access denied."
            )

        # 2. Check whether feedback already exists
        statement = select(Feedback).where(
            Feedback.message_id == message_id
        )

        feedback = db.execute(statement).scalar_one_or_none()

        # 3. Update existing feedback
        if feedback:
            feedback.rating = rating
            feedback.comment = comment

        # 4. Otherwise, create new feedback
        else:
            feedback = Feedback(
                user_id=user_id,
                message_id=message_id,
                rating=rating,
                comment=comment,
            )
            db.add(feedback)

        db.commit()
        db.refresh(feedback)

        return feedback

    except Exception:
        db.rollback()
        raise


def list_admin_feedback(
    db: Session,
    rating: str | None = None,
) -> list[dict]:
    """
    List all submitted feedback for Admin review with user and message details.
    """
    from backend.app.models.user import User

    statement = (
        select(Feedback, User, Message)
        .join(User, Feedback.user_id == User.id)
        .join(Message, Feedback.message_id == Message.id)
        .order_by(Feedback.created_at.desc())
    )

    if rating in ("positive", "negative"):
        statement = statement.where(Feedback.rating == rating)

    rows = db.execute(statement).all()
    results = []
    for fb, u, m in rows:
        results.append(
            {
                "id": fb.id,
                "message_id": fb.message_id,
                "user_id": fb.user_id,
                "user_email": u.email,
                "user_name": u.full_name,
                "query_snippet": m.content[:150] if m.content else "",
                "rating": fb.rating,
                "comment": fb.comment,
                "created_at": fb.created_at,
            }
        )
    return results