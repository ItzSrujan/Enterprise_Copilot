from collections.abc import Sequence

from langchain_core.messages import (
    AIMessage,
    HumanMessage,
    SystemMessage,
)
from langchain_openai import ChatOpenAI

from backend.app.core.config import settings


class OpenRouterLLM:
    """LangChain chat client for OpenRouter-hosted models."""

    def __init__(self) -> None:
        api_key = settings.openrouter_api_key.get_secret_value()

        if not api_key.strip():
            raise ValueError("OPENROUTER_API_KEY must not be empty.")

        self.model = settings.openrouter_model
        self.max_tokens = settings.openrouter_max_tokens
        self.temperature = settings.openrouter_temperature

        self.llm = ChatOpenAI(
            model=self.model,
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1",
            temperature=self.temperature,
            max_tokens=self.max_tokens,
            timeout=settings.openrouter_timeout,
            max_retries=2,
        )

    def generate(
        self,
        messages: Sequence[dict[str, str]],
        *,
        max_tokens: int | None = None,
        temperature: float | None = None,
    ) -> str:
        """Generate text using the configured OpenRouter model."""

        if not messages:
            raise ValueError("At least one message is required.")

        message_types = {
            "system": SystemMessage,
            "user": HumanMessage,
            "assistant": AIMessage,
        }

        converted_messages = []

        for message in messages:
            role = message.get("role")
            content = message.get("content")

            if (
                role not in message_types
                or not isinstance(content, str)
                or not content.strip()
            ):
                raise ValueError("Invalid chat message.")

            converted_messages.append(
                message_types[role](content=content)
            )

        model = self.llm

        overrides = {}

        if max_tokens is not None:
            overrides["max_tokens"] = max_tokens

        if temperature is not None:
            overrides["temperature"] = temperature

        if overrides:
            model = model.bind(**overrides)

        response = model.invoke(converted_messages)
        content = response.content

        if not isinstance(content, str) or not content.strip():
            raise RuntimeError(
                "OpenRouter returned an empty or non-text response."
            )

        return content.strip()