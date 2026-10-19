from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.auth.jwt import decode_access_token
from backend.app.db.session import get_db
from backend.app.models.user import User

bearer_scheme = HTTPBearer(auto_error = False)

def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[Session, Depends(get_db)]
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "Missing bearer token",
            headers = {"WWW-Authenticate": "Bearer"}
        )
        
    token = credentials.credentials
    
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
