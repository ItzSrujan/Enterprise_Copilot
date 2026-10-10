
from langchain_core.documents import Document

from backend.app.rag.guardrails.relevance import (
    filter_relevant_documents,
    has_sufficient_context,
)


def main():
        # Test 1: Empty document list
    assert filter_relevant_documents([], min_score=0.0) == []

    # Test 2: Score exactly at the threshold
    boundary_doc = Document(
        page_content="Boundary score document",
        metadata={"reranker_score": 0.5},
    )
    boundary_result = filter_relevant_documents(
        [boundary_doc],
        min_score=0.5,
    )
    assert len(boundary_result) == 1

    # Test 3: Invalid minimum document count
    try:
        has_sufficient_context([], min_documents=0)
        raise AssertionError("Expected ValueError was not raised")
    except ValueError:
        pass

    print("Empty documents: PASSED")
    print("Threshold boundary: PASSED")
    print("Invalid minimum count: PASSED")


if __name__ == "__main__":
    main()
