from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr
class Settings(BaseSettings):
    """
    Application configuration loaded from environment variables.
    """
    embedding_provider: str = "huggingface"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_device: str = "cpu"
    normalize_embeddings: bool = True
    database_url: str
    reranker_model: str = "BAAI/bge-reranker-base"
    reranker_device: str = "cpu"
    reranker_max_length: int = 512
    openrouter_api_key: SecretStr
    openrouter_model: str
    openrouter_max_tokens: int = 1028
    openrouter_temperature: float = 0.1
    openrouter_timeout: int = 60
    
    model_config = SettingsConfigDict(
        env_file = ".env",
        env_file_encoding = "utf-8",
        case_sensitive = False,
        extra = "ignore"
    )

settings = Settings()