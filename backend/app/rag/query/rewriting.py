from collections.abc import Sequence

FOLLOW_UP_PREFIXES = (
    "what about",
    "how about",
    "and what about",
    "what if",
    "how does that apply to"
)

def rewrite_query(
    query: str,
    conversation_history: Sequence[dict[str, str]] | None = None
) -> str:
    """Resolve simple follow-up questions using recent conversation history."""
    query = query.strip()
    
    if not query or not conversation_history:
        return query

    normalized_query = query.lower().strip("?.! ")
    
    is_follow_up = any(
        normalized_query.startswith(prefix)
        for prefix in FOLLOW_UP_PREFIXES
    )
    
    if not is_follow_up:
        return query
    
    previous_user_questions = [
        message["content"].strip()
        for message in conversation_history
        if message.get("role") == "user"
        and message.get("content","").strip()
    ]
    
    if not previous_user_questions:
        return query
    
    previous_questions = previous_user_questions[-1]
    
    # Preserve the previous topic and add the follow-up question.
    return(
        f"Previous question: {previous_questions}"
        f"\nFollow up question: {query}"
    )