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