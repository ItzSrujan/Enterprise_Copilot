from sqlalchemy import select, func, update
from sqlalchemy.orm import Session, selectinload

from backend.app.models.conversation import Conversation
from backend.app.models.message import Message

def create_conversation(
    db: Session,
    user_id: int,
    title: str = "New conversation"
) -> Conversation:
    conversation = Conversation(
        user_id = user_id,
        title = title
    )
    
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    
    return conversation

def get_user_conversation(
    db: Session,
    conversation_id: int,
    user_id: int
) -> Conversation | None:
    statement = (
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        ).options(selectinload(Conversation.messages))
    )
    
    return db.scalars(statement).first()

def save_message(
    db: Session,
    conversation_id: int,
    role: str,
    content: str
) -> Message:
    if role not in {"user", "assistant"}:
        raise ValueError("Role must be 'user' or 'assistant'.")
    
    message = Message(
        conversation_id = conversation_id,
        role = role,
        content = content
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    return message

def get_conversation_history(
    db: Session,
    conversation_id: int,
    user_id: int
) -> list[dict[str, str]]:
    conversation = get_user_conversation(
        db = db,
        conversation_id = conversation_id,
        user_id = user_id
    )
    
    if conversation is None:
        return []
    
    return[
        {
            "role": message.role,
            "content": message.content
        }
        for message in conversation.messages
    ]
    
def list_user_conversation(
    db: Session,
    user_id: int
) -> list[Conversation]:
    statement = (
        select(Conversation).where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    )
    
    return list(db.scalars(statement).all())

def delete_conversation(
    db: Session,
    conversation_id: int,
    user_id: int
) -> bool:
    conversation = db.scalar(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
    )
    
    if conversation is None:
        return False
    
    db.delete(conversation)
    db.commit()
    
    return True

def save_message_pair(
    db: Session,
    conversation_id: int,
    user_content: str,
    assistant_content: str
):
    """Save a user message and assistant response atomically."""
    user_message = Message(
     conversation_id = conversation_id,
     role = "user",
     content = user_content   
    )
    
    assistant_message = Message(
        conversation_id = conversation_id,
        role = "assistant",
        content = assistant_content
    )
    
    try:
        db.add_all(
            [
                user_message,
                assistant_message
            ]
        )
        
        db.execute(
            update(Conversation)
            .where(Conversation.id == conversation_id)
            .values(updated_at = func.now())
        )
        
        db.flush()
        
        db.commit()
        
        return user_message, assistant_message
    except Exception:
        db.rollback()
        raise