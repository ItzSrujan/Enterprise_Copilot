from collections.abc import Sequence
from backend.app.rag.query.classification import classify_query
from backend.app.rag.query.rewriting import rewrite_query

def process_query(
    query: str,
    conversation_history: Sequence[dict[str, str]] | None = None
) -> dict[str, str]:
    if not query.strip():
        raise ValueError("Query cannot be empty")
    
    rewritten_query = rewrite_query(
        query = query,
        conversation_history = conversation_history
    )
    
    category = classify_query(query = query)
    
    return{
        "original_query": query.strip(),
        "rewritten_query": rewritten_query,
        "category": category
    }