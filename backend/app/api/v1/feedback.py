from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.auth.dependencies import get_current_user
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.schemas.feedback import (
    FeedbackCreate,
    FeedbackResponse,
)
from backend.app.services.feedback_service import (
    submit_or_update_feedback,
)

router = APIRouter(prefix = "/feedback", tags = ["Feedback"])

@router.post(
    "",
    response_model = FeedbackResponse,
    status_code = status.HTTP_200_OK
)
def submit_feedback(
    request: FeedbackCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    try:
        feedback = submit_or_update_feedback(
            db = db,
            user_id = current_user.id,
            message_id = request.message_id,
            rating = request.rating,
            comment = request.comment 
        )
        
        return feedback
    
    except ValueError as exc:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = str(exc)
        ) from exc