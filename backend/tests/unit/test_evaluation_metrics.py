
from backend.app.evaluation.metrics import (
    calculate_precision,
    calculate_recall,
    calculate_f1,
    calculate_mrr,
    calculate_retrieval_metrics,
)


def test_precision():
    assert calculate_precision(
        [10, 20, 30, 40, 50],
        [10, 30, 60, 70],
    ) == 0.4


def test_recall():
    assert calculate_recall(
        [10, 20, 30, 40, 50],
        [10, 30, 60, 70],
    ) == 0.5


def test_f1():
    assert round(calculate_f1(0.4, 0.5), 4) == 0.4444


def test_mrr():
    assert calculate_mrr(
        [10, 20, 30],
        [30],
    ) == 1 / 3


def test_empty_retrieval():
    assert calculate_precision([], [10]) == 0.0


def test_empty_relevant_chunks():
    assert calculate_recall([10, 20], []) == 0.0


def test_combined_metrics():
    result = calculate_retrieval_metrics(
        [10, 20, 30, 40, 50],
        [10, 30, 60, 70],
    )

    assert result == {
        "precision": 0.4,
        "recall": 0.5,
        "f1_score": 0.4444,
        "mrr": 1.0,
    }
