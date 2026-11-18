
import logging
import time
from contextlib import contextmanager
from typing import Any

logger = logging.getLogger(__name__)


def record_metric(
    metric_name: str,
    value: float,
    unit: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    """
    Record a numerical application metric.

    Example:
        record_metric("request_latency", 1.25, "seconds")
    """

    logger.info(
        "Metric recorded | name=%s | value=%s | unit=%s | metadata=%s",
        metric_name,
        value,
        unit or "none",
        metadata or {},
    )


def record_event(
    event_name: str,
    metadata: dict[str, Any] | None = None,
) -> None:
    """
    Record an application event.

    Example:
        record_event("llm_request_failed", {"component": "generation"})
    """

    logger.info(
        "Event recorded | name=%s | metadata=%s",
        event_name,
        metadata or {},
    )


@contextmanager
def measure_time(metric_name: str):
    """
    Measure execution time and record it as a metric.
    """

    start_time = time.perf_counter()

    try:
        yield
    except Exception as exc:
        record_event(
            event_name="component_failed",
            metadata={
                "component": metric_name,
                "error_type": type(exc).__name__,
            },
        )
        raise
    finally:
        duration = time.perf_counter() - start_time

        record_metric(
            metric_name=metric_name,
            value=round(duration, 6),
            unit="seconds",
        )