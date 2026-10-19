from typing import Annotated
from fastapi import Depends, HTTPException, status

from backend.app.auth.dependencies import get_current_user
from backend.app.auth.roles import UserRole
from backend.app.models.user import User

def require_roles(*allowed_roles: UserRole):
    """Allow access only to users with an allowed role."""

    def role_checker(
        current_user: Annotated[
            User,
            Depends(get_current_user)
        ]
    ) -> User:
        allowed_values = {role.value for role in allowed_roles}
        
        if current_user.role not in allowed_values:
            raise HTTPException(
                status_code = status.HTTP_403_FORBIDDEN,
                detail = "You do not have permission to access this resource"
            )
        return current_user
    return role_checker