from backend.app.rag.ingestion.pipeline import ingest_documents
from backend.app.rag.reranking.cross_encoder import CrossEncoderReranker

def main():
    query = "Why did the customer's payment fail?"
    
    print("Loading candidate chunks..")
    documents = ingest_documents("data/documents")
    
    if not documents:
        raise RuntimeError("No documents were generated")
    
    print(f"Candidate chunks: {len(documents)}")
    
    candidates = documents[:20]
    
    print("\nLoading cross-encoder model...")
    reranker = CrossEncoderReranker()
    
    print("\nReranking candidates...")
    results = reranker.rerank(
        query = query,
        documents = candidates,
        top_n = 5  
    )
    
    print(f"\,Query: {query}")
    
    for rank, document in enumerate(results, start=1):
        print("\n" + "-" * 60)
        print(f"Rank: {rank}")
        print(f"File: {document.metadata.get('file_name')}")
        print(f"Page: {document.metadata.get('page')}")
        print(f"Reranker score: {document.metadata['reranker_score']:.4f}")
        print(document.page_content[:300])

    assert results, "Reranker returned no results."
    assert len(results) <= 5
    assert all(
        "reranker_score" in document.metadata
        for document in results
    )

    print("\nRERANKING TEST PASSED")


if __name__ == "__main__":
    main()