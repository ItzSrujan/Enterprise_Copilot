from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.auth.jwt import create_access_token
from backend.app.db.session import get_db
from backend.app.schemas.auth import LoginRequest, TokenResponse, UserResponse, RegisterRequest
from backend.app.services.auth_service import authenticate_user, register_user
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

@router.post(
    "/register",
    response_model = UserResponse,
    status_code = status.HTTP_201_CREATED
)
def register(
    request: RegisterRequest,
    db: Annotated[Session, Depends(get_db)]
) -> UserResponse:
    try:
        user = register_user(
            db = db,
            full_name = request.full_name,
            email = str(request.email),
            password = request.password,
            role = request.role,
            invitation_code = request.invitation_code 
        )
        return user
    except ValueError as error:
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail = str(error)
        )

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

@router.get(
    "/users",
    response_model=list[UserResponse],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)
def list_users(
    db: Annotated[Session, Depends(get_db)]
) -> list[User]:
    return db.query(User).order_by(User.id.asc()).all()