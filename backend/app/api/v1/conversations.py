from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.auth.dependencies import get_current_user
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.schemas.conversation import(
    ConversationCreate,
    ConversationResponse,
    ConversationDetailResponse,
)

from backend.app.services.conversation_service import (
    create_conversation,
    get_user_conversation,
    list_user_conversation,
    delete_conversation
)

router = APIRouter(prefix = "/conversations", tags = ["Conversations"])

DBSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]

@router.post(
    "",
    response_model = ConversationResponse,
    status_code = status.HTTP_201_CREATED
)
def create_new_conversation(
    payload: ConversationCreate,
    db: DBSession,
    current_user: CurrentUser
):
    return create_conversation(
        db = db,
        user_id = current_user.id,
        title = payload.title
    )
    
@router.get(
    "",
    response_model = list[ConversationResponse]
)
def get_conversations(
    db: DBSession,
    current_user: CurrentUser
):
    return list_user_conversation(
        db = db,
        user_id = current_user.id
    )

@router.get(
    "/{conversation_id}",
    response_model = ConversationDetailResponse
)
def get_conversation(
    conversation_id: int,
    db: DBSession,
    current_user: CurrentUser
):
    conversation = get_user_conversation(
        db = db,
        conversation_id = conversation_id,
        user_id = current_user.id  
    )
    
    if conversation is None:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = "Conversation not found"
        )
    
    return conversation

@router.delete(
    "/{conversation_id}",
    status_code = status.HTTP_204_NO_CONTENT
)
def remove_conversation(
    conversation_id: int,
    db: DBSession,
    current_user: CurrentUser
):
    delete = delete_conversation(
        db = db,
        conversation_id = conversation_id,
        user_id = current_user.id
    )
    
    if not delete:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = "Conversation not found"
        )
    return None