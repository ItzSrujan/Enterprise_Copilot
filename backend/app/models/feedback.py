from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Text,
    func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.db.base import Base

class Feedback(Base):
    __tablename__ = "feedback"
    
    __table_args__ = (
        CheckConstraint(
            "rating IN ('positive', 'negative')",
            name = "check_feedback_rating"
        ),
    )
    
    id: Mapped[int] = mapped_column(Integer, primary_key = True, index = True)
    
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete = "CASCADE"),
        nullable = False,
        index = True
    )
    
    message_id: Mapped[int] = mapped_column(
        ForeignKey("messages.id", ondelete = "CASCADE"),
        nullable = False,
        unique = True,
        index = True
    )
    
    rating: Mapped[str] = mapped_column(Text, nullable = False)
    comment: Mapped[str | None] = mapped_column(Text, nullable = True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone = True),
        server_default = func.now(),
        nullable = False 
    )
    
    user = relationship("User")
    message = relationship("Message")