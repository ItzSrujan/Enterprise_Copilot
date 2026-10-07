from langchain_huggingface import HuggingFaceEmbeddings
from backend.app.core.config import settings

def get_hf_embeddings() -> HuggingFaceEmbeddings:
    """
    Create the configured Hugging Face embedding model
    """
    
    return HuggingFaceEmbeddings(
        model_name = settings.embedding_model,
        model_kwargs = {
            "device": settings.embedding_device
        },
        encode_kwargs = {
            "normalize_embeddings": settings.normalize_embeddings
        }
    )