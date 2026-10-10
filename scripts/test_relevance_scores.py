from backend.app.rag.retrieval.retriever import DocRetriever


def main():
    retriever = DocRetriever()

    queries = [
        "How do I troubleshoot a pending UPI payment?",
        "What is the employee annual leave policy?",
    ]

    for query in queries:
        print(f"\nQuery: {query}")

        documents = retriever.retrieve(
            query=query,
            top_k=5,
            candidate_k=20,
        )

        if not documents:
            print("No documents retrieved.")
            continue

        for index, document in enumerate(documents, start=1):
            print(
                f"{index}. Score: "
                f"{document.metadata.get('reranker_score')}"
            )
            print(
                "   Source:",
                document.metadata.get("file_name")
                or document.metadata.get("source"),
            )


if __name__ == "__main__":
    main()