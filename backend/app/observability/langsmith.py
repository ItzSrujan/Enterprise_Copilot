import logging, os

from backend.app.core.config import settings

logger = logging.getLogger(__name__)

def initialize_langsmith() -> bool:
    """
    Configure LangSmith tracing using application settings.

    Returns:
        True if tracing is configured, otherwise False.
    """
    
    if not settings.langsmith_tracing:
        os.environ["LANGSMITH_TRAICING"] = "false"
        logger.info("Langsmith tracing is disabled")
        return False
    
    if not settings.langsmith_api_key:
        logger.warning("Langsmith tracing requested but API key is missing")
        os.environ["LANGSMITH_TRAICING"] = "false"
        return False
    
    # Configure environment variables used by LangChain tracing.
    os.environ["LANGSMITH_TRACING"] = "true"
    os.environ["LANGSMITH_API_KEY"] = (
        settings.langsmith_api_key.get_secret_value()
    )
    os.environ["LANGSMITH_PROJECT"] = settings.langsmith_project
    os.environ["LANGSMITH_ENDPOINT"] = settings.langsmith_endpoint

    logger.info(
        "LangSmith tracing configured for project: %s",
        settings.langsmith_project,
    )

    return True