from collections.abc import Sequence
from functools import lru_cache

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from backend.app.rag.generation.llm import OpenRouterLLM

QUERY_REWRITE_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a query rewriting assistant for an enterprise RAG system.

Your task is to rewrite the latest user question into a standalone question
using the supplied conversation history.

RULES:
- Resolve references such as "it", "that", "they", and "this".
- Use previous user and assistant messages to understand the context.
- Preserve the original intent of the latest question.
- Do not answer the question.
- Do not add facts that are not present in the conversation.
- If the question is already standalone, keep its meaning unchanged.
- Return only the rewritten question.
- Do not include explanations, labels, or quotation marks."""
        ),
        (
            "human",
            """Conversation history:
{conversation_history}

Latest user question:
{question}

Standalone question:"""
        ),
    ]
)

@lru_cache(maxsize = 1)
def get_query_rewriter_chain():
    llm = OpenRouterLLM().llm
    return QUERY_REWRITE_PROMPT | llm | StrOutputParser()
    
def rewrite_query(
    query: str,
    conversation_history: Sequence[dict[str, str]] | None = None
) -> str:
    """Rewrite a follow-up question using recent conversation history."""
    query = query.strip()
    
    if not query:
        raise ValueError("Query cannot be empty")

    if not conversation_history:
        return query
    
    history_parts = []
    
    for message in conversation_history:
        role = message.get("role")
        content = message.get("content", "").strip()
        
        if role not in {"user", "assistant"} or not content:
            continue
        
        speaker = "User" if role == "user" else "Assistant"
        history_parts.append(f"{speaker}: {content}")
        
    if not history_parts:
        return query
    
    formatted_history = "\n".join(history_parts)
    
    chain = get_query_rewriter_chain()
    
    response = chain.invoke(
        {
            "conversation_history": formatted_history,
            "question": query
        }
    )
    rewritten_query = response.strip()
    
    if not rewritten_query:
        raise RuntimeError("Query rewriter returned an empty response.")
    
    return rewritten_query