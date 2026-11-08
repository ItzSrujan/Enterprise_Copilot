from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from backend.app.models.user import User
from backend.app.core.security import verify_password, hash_password
from backend.app.auth.invitations import verify_invitation_code

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

def register_user(
    db: Session,
    full_name: str,
    email: str,
    password: str,
    role: str = "employee",
    invitation_code: str | None = None
) -> User:
    normalized_email = email.strip().lower()
    
    existing_user = get_user_by_email(
        db = db,
        email = email
    )
    
    if role not in {"admin", "employee"}:
        raise ValueError("Invalid role. Only 'admin' and 'employee' are permitted.")

    if role == "admin":
        is_valid = verify_invitation_code(
            role = role,
            invitation_code = invitation_code
        )
        
        if not is_valid:
            raise ValueError("Invalid invitation code")
        
    hashed_password = hash_password(password)
    
    new_user = User(
        full_name = full_name.strip(),
        email = normalized_email,
        hashed_password = hashed_password,
        role = role,
        is_active = True
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
    except IntegrityError:
        db.rollback()
        raise ValueError("Email is already registered")
    
    except Exception:
        db.rollback()
        raise
    
    return new_user