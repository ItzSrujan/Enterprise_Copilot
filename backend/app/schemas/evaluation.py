from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

class EvaluationCreate(BaseModel):
    question: str = Field(min_length = 3)
    expected_answer: str | None = None

class EvaluationResponse(BaseModel):
    id: int
    question: str
    generated_answer: str
    expected_answer: str | None
    metrics: dict
    overall_score: float | None
    status: Literal["completed", "failed"]
    error_message: str | None
    evaluated_by: int | None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes = True)