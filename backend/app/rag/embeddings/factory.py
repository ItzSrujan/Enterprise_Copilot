from langchain_core.embeddings import Embeddings
from backend.app.core.config import settings
from backend.app.rag.embeddings.huggingface import get_hf_embeddings

def get_embeddings() -> Embeddings:
    """
    Return the configured embedding provider.
    """
    
    if settings.embedding_provider == "huggingface":
        return get_hf_embeddings()
    
    raise ValueError(
        f"Unsupported embedding provider: {settings.embedding_provider}"
    )