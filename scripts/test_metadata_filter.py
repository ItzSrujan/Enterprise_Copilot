from backend.app.rag.ingestion.pipeline import ingest_documents
from backend.app.rag.retrieval.filters import filter_documents


def main():
    documents = ingest_documents("data/documents")

    print(f"Total chunks: {len(documents)}")

    policy_chunks = filter_documents(
        documents,
        doc_type="policies",
    )

    print(f"Policy chunks: {len(policy_chunks)}")

    assert policy_chunks, "No policy chunks found."

    assert all(
        document.metadata.get("document_type") == "policies"
        for document in policy_chunks
    ), "A non-policy chunk passed the filter."

    print("\nSample policy chunks:")

    for document in policy_chunks[:3]:
        print(f"\nFile: {document.metadata.get('file_name')}")
        print(f"Page: {document.metadata.get('page')}")
        print(document.page_content[:200])

    print("\nMETADATA FILTER TEST PASSED")


if __name__ == "__main__":
    main()