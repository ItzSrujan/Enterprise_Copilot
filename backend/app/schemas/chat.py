
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=5000)

    conversation_history: list[dict[str, str]] | None = None

    top_k: int = Field(default=5, ge=1, le=20)
    candidate_k: int = Field(default=20, ge=1, le=100)

    document_type: str | None = None
    file_name: str | None = None

    model_config = ConfigDict(str_strip_whitespace=True)

    @field_validator("document_type", "file_name", mode="before")
    @classmethod
    def normalize_optional_filters(cls, value: Any) -> Any:
        if isinstance(value, str):
            value = value.strip()
            if not value or value.lower() == "string":
                return None
        return value


class ChatResponse(BaseModel):
    original_query: str
    processed_query: str
    category: str | None = None
    answer: str

    sources: list[Any] = Field(default_factory=list)
    citations: list[Any] = Field(default_factory=list)
    invalid_citations: list[Any] = Field(default_factory=list)

    has_invalid_citations: bool = False
    grounding_results: Any | None = None
    retrieved_document_count: int