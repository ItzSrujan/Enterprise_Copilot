from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.user import User
from backend.app.core.security import verify_password

def get_user_by_email(
    db: Session,
    email: str
) -> User | None:
    normalized_email = email.strip().lower()
    statement = select(User).where(
        User.email == normalized_email
    )
    
    return db.scalar(statement)

def authenticate_user(
    db: Session,
    email: str,
    password: str
) -> User | None:
    user = get_user_by_email(db = db, email = email)
    
    if user is None:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    if not user.is_active:
        return None
    
    return user