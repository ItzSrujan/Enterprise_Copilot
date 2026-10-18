from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.auth.jwt import decode_access_token
from backend.app.db.session import get_db
from backend.app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl = "/api/v1/auth/login"
)

def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)]
) -> User:
    credentials_error = HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail = "Could not validate credentials",
        headers = {"WWW-Authenticate": "Bearer"}
    )
    
    try:
        payload = decode_access_token(token)
        user_id = int(payload["sub"])
        
    except (ValueError, TypeError, KeyError):
        raise credentials_error
    
    user = db.scalar(
        select(User).where(User.id == user_id)
    )
    
    if user is None or not user.is_active:
        raise credentials_error
    
    return user
