from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    id: int
    file_name: str
    file_path: str
    document_type: str
    status: str
    chunk_count: int
    error_message: str | None
    uploaded_by: int | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)