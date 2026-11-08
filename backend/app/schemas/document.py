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


class CategoryStats(BaseModel):
    category: str
    count: int
    chunks: int


class AdminStatsResponse(BaseModel):
    total_documents: int
    processed_documents: int
    failed_documents: int
    processing_documents: int
    total_users: int
    total_chunks: int
    category_distribution: list[CategoryStats]
    recent_documents: list[DocumentResponse]