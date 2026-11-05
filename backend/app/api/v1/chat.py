
from functools import lru_cache
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.auth.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.rag.pipeline import RAGPipeline
from backend.app.schemas.chat import ChatRequest, ChatResponse
from backend.app.db.session import get_db
from backend.app.services.conversation_service import (
    create_conversation,
    get_user_conversation,
    get_conversation_history,
    save_message_pair,
)
from sqlalchemy.orm import Session

router = APIRouter(prefix="/chat", tags=["Chat"])


@lru_cache(maxsize=1)
def get_rag_pipeline() -> RAGPipeline:
    """Reuse one RAG pipeline instance within this process."""
    return RAGPipeline()


@router.post("", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ChatResponse:
    """Answer an authenticated user's question using persistent RAG history."""
    conversation_id = request.conversation_id
    try:
        if conversation_id is None:
            conversation = create_conversation(
                db = db,
                user_id = current_user.id,
                title = request.question[:255]
            )
            conversation_id = conversation.id
            history = request.conversation_history or []
        else:
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
            
            history = get_conversation_history(
                db = db,
                conversation_id = conversation_id,
                user_id = current_user.id
            )
            
        pipeline = get_rag_pipeline()
        result = pipeline.run(
            question = request.question,
            conversation_history = history,
            top_k = request.top_k,
            candidate_k = request.candidate_k,
            document_type = request.document_type,
            file_name = request.file_name   
        )
        
        save_message_pair(
            db=db,
            conversation_id=conversation_id,
            user_content=request.question,
            assistant_content=result["answer"],
        )
        
        result["conversation_id"] = conversation_id
        return ChatResponse(**result)
    
    except HTTPException:
        raise
    
    except ValueError as exc:
        raise HTTPException(
            status_code = status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail = str(exc)
        ) from exc