from sqlalchemy.orm import Session

from backend.app.memory.history import get_recent_messages

class ConversationMemoryManager:
    """Manage conversation history for the RAG pipeline."""
    def __init__(self, history_limit: int = 10):
        if history_limit <= 0:
            raise ValueError("History limit must be positive.")
        
        self.history_limit = history_limit
    
    def load_history(
        self,
        db: Session,
        conversation_id: int,
        user_id: int
    ) -> list[dict[str, str]]:
        # Load recent conversation messages from PostgreSQL.
        
        return get_recent_messages(
            db = db,
            conversation_id = conversation_id,
            user_id = user_id,
            limit = self.history_limit
        )