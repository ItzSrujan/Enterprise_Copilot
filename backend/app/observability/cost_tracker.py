
import logging
import uuid

from contextvars import ContextVar
from contextlib import contextmanager
from dataclasses import dataclass
from typing import Any, Iterator

from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.outputs import LLMResult

from backend.app.core.config import settings
from backend.app.observability.metrics import (
    record_event,
    record_metric,
)

logger = logging.getLogger(__name__)


@dataclass
class RequestCostTracker:
    """Aggregate LLM usage for a single RAG request."""

    request_id: str

    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0

    input_cost: float = 0.0
    output_cost: float = 0.0
    total_cost: float = 0.0

    cost_available: bool = True
    llm_calls: int = 0

    def add_usage(
        self,
        input_tokens: int,
        output_tokens: int,
        input_cost: float | None = None,
        output_cost: float | None = None,
    ) -> None:
        """Add one LLM call's usage to the request."""

        self.input_tokens += input_tokens
        self.output_tokens += output_tokens
        self.total_tokens += input_tokens + output_tokens
        self.llm_calls += 1

        if input_cost is None or output_cost is None:
            self.cost_available = False
            return

        self.input_cost += input_cost
        self.output_cost += output_cost
        self.total_cost += input_cost + output_cost


_active_request_tracker: ContextVar[
    RequestCostTracker | None
] = ContextVar("active_request_tracker", default=None)


@contextmanager
def track_request_cost() -> Iterator[RequestCostTracker]:
    """
    Create a request-scoped tracker.

    All CostTrackingCallback instances executed inside this
    context contribute to the same tracker.
    """

    tracker = RequestCostTracker(
        request_id=str(uuid.uuid4())
    )

    token = _active_request_tracker.set(tracker)

    try:
        yield tracker

    finally:
        try:
            metadata = {"request_id": tracker.request_id}

            record_metric(
                "request_input_tokens",
                tracker.input_tokens,
                "tokens",
                metadata,
            )

            record_metric(
                "request_output_tokens",
                tracker.output_tokens,
                "tokens",
                metadata,
            )

            record_metric(
                "request_total_tokens",
                tracker.total_tokens,
                "tokens",
                metadata,
            )

            record_metric(
                "request_llm_calls",
                tracker.llm_calls,
                "calls",
                metadata,
            )

            if tracker.llm_calls == 0:
                tracker.cost_available = False

                record_event(
                    "request_usage_unavailable",
                    metadata,
                )

            elif not tracker.cost_available:
                record_event(
                    "request_cost_incomplete",
                    metadata,
                )
            
            else:
                record_metric(
                    "request_total_cost",
                    tracker.total_cost,
                    "USD",
                    metadata
                )

            logger.info(
                "Request cost summary | request_id=%s | "
                "llm_calls=%s | input_tokens=%s | "
                "output_tokens=%s | total_tokens=%s | "
                "cost_available=%s | total_cost_usd=%.8f",
                tracker.request_id,
                tracker.llm_calls,
                tracker.input_tokens,
                tracker.output_tokens,
                tracker.total_tokens,
                tracker.cost_available,
                tracker.total_cost,
            )

        finally:
            _active_request_tracker.reset(token)


class CostTrackingCallback(BaseCallbackHandler):
    """Capture token usage and aggregate request-level cost."""

    @staticmethod
    def extract_usage(response: LLMResult) -> dict[str, Any]:
        """Extract token usage from the LLM response."""

        usage = {}

        if response.generations:
            generation = response.generations[0][0]
            message = getattr(generation, "message", None)

            if message:
                usage = (
                    getattr(message, "usage_metadata", None) or {}
                )

                if not usage:
                    metadata = (
                        getattr(message, "response_metadata", {}) or {}
                    )
                    usage = metadata.get("token_usage") or {}

        if not usage:
            llm_output = response.llm_output or {}
            usage = llm_output.get("token_usage") or {}

        return usage if isinstance(usage, dict) else {}

    @staticmethod
    def extract_model(response: LLMResult) -> str | None:
        """Extract the model identifier."""

        llm_output = response.llm_output or {}

        model = llm_output.get("model_name")

        if model:
            return model

        if response.generations:
            generation = response.generations[0][0]
            message = getattr(generation, "message", None)

            if message:
                metadata = (
                    getattr(message, "response_metadata", {}) or {}
                )

                return (
                    metadata.get("model_name")
                    or metadata.get("model")
                )

        return None

    def on_llm_end(
        self,
        response: LLMResult,
        **kwargs: Any,
    ) -> None:
        """Capture token usage and update the active tracker."""

        usage = self.extract_usage(response)

        if not usage:
            tracker = _active_request_tracker.get()

            if tracker is not None:
                tracker.cost_available = False

            record_event("llm_token_usage_unavailable")
            logger.warning("LLM token usage metadata unavailable.")
            return

        input_tokens = usage.get(
            "input_tokens",
            usage.get("prompt_tokens", 0),
        )

        output_tokens = usage.get(
            "output_tokens",
            usage.get("completion_tokens", 0),
        )

        if (
            type(input_tokens) is not int
            or type(output_tokens) is not int
            or input_tokens < 0
            or output_tokens < 0
        ):
            tracker = _active_request_tracker.get()

            if tracker is not None:
                tracker.cost_available = False

            record_event("llm_token_usage_invalid")
            logger.warning("Invalid LLM token usage metadata.")
            return

        model = self.extract_model(response)
        configured_model = settings.openrouter_model

        input_cost = None
        output_cost = None

        input_price = settings.openrouter_input_price_per_million
        output_price = settings.openrouter_output_price_per_million

        # Apply pricing only when the response model matches
        # the model whose pricing has been configured.
        if (
            model == configured_model
            and input_price is not None
            and output_price is not None
            and input_price >= 0
            and output_price >= 0
        ):
            input_cost = input_tokens * input_price / 1_000_000
            output_cost = output_tokens * output_price / 1_000_000

        tracker = _active_request_tracker.get()

        if tracker is not None:
            tracker.add_usage(
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                input_cost=input_cost,
                output_cost=output_cost,
            )

        record_metric("llm_input_tokens", input_tokens, "tokens")
        record_metric("llm_output_tokens", output_tokens, "tokens")
        record_metric(
            "llm_total_tokens",
            input_tokens + output_tokens,
            "tokens",
        )

        if input_cost is None or output_cost is None:
            logger.warning(
                "LLM cost unavailable | response_model=%s | "
                "configured_model=%s",
                model,
                configured_model,
            )
            return

        total_cost = input_cost + output_cost

        record_metric("llm_total_cost", total_cost, "USD")

        logger.info(
            "LLM usage recorded | model=%s | input=%s | "
            "output=%s | cost_usd=%.8f",
            model,
            input_tokens,
            output_tokens,
            total_cost,
        )
    
    def on_llm_error(
        self,
        error: BaseException,
        **kwargs: Any
    ) -> None:
        """Mark request cost as potentially incomplete after an LLM failure."""
        
        tracker = _active_request_tracker.get()
        
        if tracker is not None:
            tracker.cost_available = False
        
        record_event(
            "llm_call_failed",
            {
                "error_type": type(error).__name__
            }
        )
        
        logger.warning(
            "LLM call failed | error_type = %s",
            type(error).__name__
        )