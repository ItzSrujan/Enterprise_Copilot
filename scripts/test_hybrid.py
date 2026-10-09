from backend.app.rag.retrieval.hybrid import HybridRetriever

def main():
    retriever = HybridRetriever()
    
    queries = [
        "Why did the customer's payment fail?",
        "What is the refund eligibility policy?",
        "How should support handle a pending payment?",
    ]
    
    for query in queries:
        print("\n" + "=" * 60)
        print(f"Query: {query}")
        
        results = retriever.search(
            query = query,
            k = 5,
            candidate_k = 20
        )
        
        for rank, doc in enumerate(results, start = 1):
            print(f"\nRank: {rank}")
            print(f"File: {doc.metadata.get('file_name')}")
            print(f"Page: {doc.metadata.get('page')}")
            print(doc.page_content[:300])
    
if __name__ == "__main__":
    main()