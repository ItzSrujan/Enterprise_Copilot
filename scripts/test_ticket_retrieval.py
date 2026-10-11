from backend.app.rag.retrieval.tickets import TicketRetriever


def main():
    retriever = TicketRetriever()

    print("Tickets loaded:", len(retriever.documents))

    assert retriever.documents, "No tickets were loaded."

    query = "Why is a UPI payment pending?"
    results = retriever.search(query=query, k=5)

    print(f"\nQuery: {query}")
    print("Retrieved tickets:", len(results))

    for index, document in enumerate(results, start=1):
        print(f"\n{index}. Ticket ID: {document.metadata['ticket_id']}")
        print(f"Category: {document.metadata['category']}")
        print(f"Status: {document.metadata['status']}")
        print(f"Content: {document.page_content}\n")

    assert results, "Expected matching tickets for the UPI query."

    print("\nTICKET RETRIEVAL TEST PASSED")


if __name__ == "__main__":
    main()
