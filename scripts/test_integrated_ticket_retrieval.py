from backend.app.rag.retrieval.retriever import DocRetriever


def main():
    retriever = DocRetriever()

    query = "What should support do when a UPI payment is pending after authorization?"

    result = retriever.search_with_query_processing(
        query=query,
        top_k=10,
        candidate_k=20,
    )

    documents = result["documents"]

    print(f"\nOriginal query: {result['original_query']}")
    print(f"Processed query: {result['processed_query']}")
    print(f"Total documents retrieved: {len(documents)}")

    for index, document in enumerate(documents, start=1):
        print(f"\n--- Document {index} ---")
        print("Source type:", document.metadata.get("source_type", "document"))
        print("Ticket ID:", document.metadata.get("ticket_id", "N/A"))
        print("File name:", document.metadata.get("file_name", "N/A"))
        print("Content:", document.page_content[:250])

    ticket_documents = [
        document
        for document in documents
        if document.metadata.get("source_type") == "support_ticket"
    ]

    print(f"\nSupport tickets retrieved: {len(ticket_documents)}")

    if not ticket_documents:
        print(
            "No support tickets found in the integrated results. "
            "Check whether TicketRetriever is integrated into DocRetriever."
        )


if __name__ == "__main__":
    main()