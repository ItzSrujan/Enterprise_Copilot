from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.db.base import Base

class Conversation(Base):
    __tablename__ = "conversations"
    
    id: Mapped[int] = mapped_column(primary_key = True, index = True)
    
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete = "CASCADE"),
        nullable = False,
        index = True
    )
    
    title: Mapped[str] = mapped_column(
        String(255),
        nullable = False,
        default = "New Conversation"
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone = True),
        server_default = func.now(),
        nullable = False
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone = True),
        server_default = func.now(),
        onupdate = func.now(),
        nullable = False
    )
    
    messages: Mapped[list["Message"]] = relationship(
        "Message",
        back_populates = "conversation",
        cascade = "all, delete-orphan",
        order_by = "Message.created_at"
    )