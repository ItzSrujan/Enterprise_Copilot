from langchain_core.documents import Document

from backend.app.rag.retrieval.fusion import (
    reciprocal_rank_fusion,
)


def main():
    vector_results = [
        Document(
            page_content="UPI payments can fail due to timeouts.",
            metadata={
                "chunk_id": 4,
                "file_path": "payment.pdf",
                "page": 0,
            },
        )
    ]

    bm25_results = [
        Document(
            page_content="UPI payments can fail due to timeouts.",
            metadata={
                "chunk_id": 4,
                "file_path": "payment.pdf",
                "page": 0,
                "source": "payment.pdf",
            },
        )
    ]

    fused = reciprocal_rank_fusion(
        [vector_results, bm25_results]
    )

    assert len(fused) == 1
    assert fused[0].metadata["chunk_id"] == 4

    print("Fused document count:", len(fused))
    print("FUSION DEDUPLICATION TEST PASSED")


if __name__ == "__main__":
    main()