from backend.app.rag.retrieval.bm25 import BM25Retriever
from backend.app.rag.ingestion.pipeline import ingest_documents
from pathlib import Path

DATA_PATH = Path("data/documents")


def main():
    print("=" * 70)
    print("BM25 RETRIEVAL TEST")
    print("=" * 70)

    print("\n[1] Loading documents...")

    documents = ingest_documents(str(DATA_PATH))

    print(f"Generated chunks: {len(documents)}")

    if not documents:
        raise RuntimeError("No chunks were generated.")

    print("\n[2] Building BM25 index...")

    retriever = BM25Retriever(documents)

    print("BM25 index created.")

    query = "Why did the customer's payment fail?"

    print(f"\n[3] Query: {query}")

    results = retriever.search(
        query=query,
        k=5,
    )

    print(f"\nRetrieved documents: {len(results)}")

    for index, document in enumerate(results, start=1):
        print("\n" + "-" * 70)
        print(f"Result #{index}")
        print(f"File: {document.metadata.get('file_name')}")
        print(f"Page: {document.metadata.get('page')}")
        print(
            f"Document type: "
            f"{document.metadata.get('document_type')}"
        )

        print("\nContent:")
        print(document.page_content[:500])

    print("\n" + "=" * 70)
    print("BM25 TEST COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    main()