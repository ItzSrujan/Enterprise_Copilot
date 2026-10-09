from backend.app.rag.query.processor import process_query

def main():
    history = [
        {"role": "user", "content": "What is our refund policy?"},
        {
            "role": "assistant",
            "content": "Refund eligibility depends on payment status.",
        },
    ]

    result = process_query(
        query = "What about UPI?",
        conversation_history = history
    )
    
    print("Query procesing result: ")
    for key, value in result.items():
        print(f"{key}: {value}")
        
    assert result["original_query"] == "What about UPI?"
    assert "refund policy" in result["rewritten_query"].lower()
    assert result["category"] == "payments"
    
    # A clear query should not be written
    clear_query = process_query(
        query = "Why do payment gateway timeouts happen?"
    )
    
    assert{
        clear_query["rewritten_query"] == "Why do payment gateway timeout happend?"
    }
    
    print("\nQUERY PROCESSING TEST PASSES")
    
if __name__ == "__main__":
    main()