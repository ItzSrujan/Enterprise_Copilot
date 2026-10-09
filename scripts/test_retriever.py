from backend.app.rag.retrieval.retriever import DocRetriever

def main():
    retriever = DocRetriever()
    
    query = "Why did the customer's payment fail?"
    
    results = retriever.retrieve(
        query = query,
        candidate_k = 20,
        top_k = 5
    )
    
    print(f"\nQuery: {query}")
    print(f"Retrieved {len(results)} documents\n")
    
    for rank, document in enumerate(results, start = 1):
        print(f"Rank: {rank}")
        print(f"File: {document.metadata.get('file_name')}")
        print(f"Page: {document.metadata.get('page', 0) + 1}")
        print(f"Reranker score: {document.metadata.get('reranker_score')}")
        print(f"Content: {document.page_content[:500]}")
        print("-" * 60)
        
    assert results, "No documents were retrieved"
    assert len(results) <= 5, "More than 5 documents were returned"
    assert all(
        "reranker_score" in doc.metadata
        for doc in results
    ), "Some results are missing reranker scores."
    
    print("\nUNIFIED RETRIEVEL TEST PASSED")

if __name__ == "__main__":
    main()