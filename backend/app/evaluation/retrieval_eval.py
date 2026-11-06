from langchain_core.documents import Document

from backend.app.evaluation.metrics import (
    calculate_retrieval_metrics,
)

def evaluate_retrieval(
    retrieved_documents: list[Document],
    relevant_chunk_ids: list[int],
) -> dict[str, float]:

    retrieved_ids = []

    for document in retrieved_documents:
        chunk_id = document.metadata.get("chunk_id")

        if chunk_id is not None:
            retrieved_ids.append(int(chunk_id))

    return calculate_retrieval_metrics(
        retrieved_ids=retrieved_ids,
        relevant_ids=relevant_chunk_ids,
        retrieved_count=len(retrieved_documents),
    )