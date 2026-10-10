from backend.app.rag.retrieval.retriever import DocRetriever

def main():
    retriever = DocRetriever()
    
    history = [
        {
            "role": "user",
            "content": "What is our refund policy?"
        },
        {
            "role": "assistant",
            "content": "Refund eligibility depends on payment status."
        },
    ]
    
    result = retriever.search_with_query_processing(
        query = "What about UPI?",
        conversation_history = history,
        top_k = 5,
        candidate_k = 20
    )
    
    print("\nOriginal query:", result["original_query"])
    print("Processed query:", result["processed_query"])
    print("Category:", result["category"])
    
    print("\nRetrieved documents: ")
    for index, document in enumerate(result["documents"], start = 1):
        print(f"\n{index}. {document.metadata.get('source', 'Unknown source')}")
        print(f"Content: {document.page_content[:300]}")
        print(f"Metadata: {document.metadata}")
    
    assert result["original_query"] == "What about UPI?"
    assert result["category"] == "payments"
    assert isinstance(result["documents"], list)

    print("\nQUERY + RETRIEVAL INTEGRATION TEST COMPLETED")


if __name__ == "__main__":
    main()
        