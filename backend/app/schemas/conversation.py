from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class ConversationCreate(BaseModel):
    title: str = Field(
        default = "New conversation",
        min_length = 1,
        max_length = 255   
    )
    
class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes = True)
    
class ConversationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes = True)
    
class ConversationDetailResponse(ConversationResponse):
    messages: list[MessageResponse] = Field(default_factory = list)