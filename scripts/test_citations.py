
from backend.app.rag.citations.extractor import extract_citations
from backend.app.rag.citations.validator import validate_citations


def main():
    answer = (
        "A UPI payment can remain pending if the callback is delayed [S1]. "
        "Check reconciliation before retrying [S2]. "
        "See the nonexistent source [S9]."
    )

    sources = [
        {"source_id": "S1", "file_name": "payment_gateway.pdf"},
        {"source_id": "S2", "file_name": "payment_policy.pdf"},
    ]

    print("Extracted:", extract_citations(answer))

    result = validate_citations(answer, sources)
    print("Validation:", result)

    assert extract_citations(answer) == ["S1", "S2", "S9"]
    assert result["citations"] == ["S1", "S2"]
    assert result["invalid_citations"] == ["S9"]
    assert result["has_invalid_citations"] is True

    print("\nCITATION TEST PASSED")


if __name__ == "__main__":
    main()
