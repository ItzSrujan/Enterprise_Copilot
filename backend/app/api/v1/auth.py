from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.auth.jwt import create_access_token
from backend.app.db.session import get_db
from backend.app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from backend.app.services.auth_service import authenticate_user
from backend.app.auth.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.auth.permissions import require_roles
from backend.app.auth.roles import UserRole


router = APIRouter(
    prefix = "/auth",
    tags = ["Authentication"]
)

@router.post("/login", response_model = TokenResponse)
def login(
    credentials: LoginRequest,
    db: Annotated[Session, Depends(get_db)]
) -> TokenResponse:
    user = authenticate_user(
        db = db,
        email = str(credentials.email),
        password = credentials.password
    )
    
    if user is None:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "Invalid email or password",
            headers = {"WWW-Authenticate": "Bearer"}
        )
        
    access_token = create_access_token(
        user_id = user.id,
        role = user.role        
    )
    
    return TokenResponse(access_token = access_token)

@router.get("/me", response_model = UserResponse)
def get_me(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    return current_user

@router.get(
    "/admin-check",
    dependencies = [Depends(require_roles(UserRole.ADMIN))]
)
def admin_check():
    return{"message": "Admin access granted"}