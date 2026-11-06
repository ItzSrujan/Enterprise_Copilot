from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

class FeedbackCreate(BaseModel):
    message_id: int
    rating: Literal["positive", "negative"]
    comment: str | None = Field(default = None, max_length = 1000)

class FeedbackResponse(BaseModel):
    id: int
    message_id: int
    rating: Literal["positive", "negative"]
    comment: str | None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes = True)