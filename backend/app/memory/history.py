from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.conversation import Conversation
from backend.app.models.message import Message

def get_recent_messages(
    db: Session,
    conversation_id: int,
    user_id: int,
    limit: int = 10
) -> list[dict[str, str]]:
    # Retrieve the most recent messages from a user's conversation.
    # Returns messages in chronological order.
    
    if limit <= 0:
        raise ValueError("History limit must be positive")
    
    statement = (
        select(Message)
        .join(
            Conversation,
            Message.conversation_id == Conversation.id
        )
        .where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
        .order_by(
            Message.created_at.desc(),
            Message.id.desc()
        )
        .limit(limit)
    )
    
    messages = list(db.scalars(statement).all())
    
    # Database returns newest first.
    # Reverse to maintain chronological order.
    messages.reverse()
    
    return[
        {
            "role": message.role,
            "content": message.content
        }
        for message in messages
    ]