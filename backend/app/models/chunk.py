from datetime import datetime, timezone
from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.db.base import Base

class Chunk(Base):
    __tablename__ = "chunks"
    
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key = True,
        autoincrement = True
    )
    
    content: Mapped[str] = mapped_column(
        Text,
        nullable = False
    )
    
    embedding: Mapped[list[float]] = mapped_column(
        Vector(384),
        nullable = False
    )
    
    file_name: Mapped[str] = mapped_column(
        String(256),
        nullable = False
    )
    
    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable = False
    )
    
    document_type: Mapped[str] = mapped_column(
        String(100),
        nullable = False
    )
    
    page: Mapped[int | None] = mapped_column(
        Integer,
        nullable = False
    )
    
    meta_data: Mapped[dict] = mapped_column(
        JSONB,
        nullable = False,
        default = dict
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone = True),
        default = lambda: datetime.now(timezone.utc),
        nullable = False
    )