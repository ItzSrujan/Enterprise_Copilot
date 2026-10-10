
from backend.app.rag.retrieval.retriever import DocRetriever
from backend.app.rag.generation.generator import RAGGenerator


def main():
    retriever = DocRetriever()
    generator = RAGGenerator()

    questions = [
        "Why can a UPI payment remain pending?",
        "What is the employee annual leave policy?",
    ]

    for question in questions:
        print(f"\n{'=' * 60}")
        print(f"Question: {question}")

        retrieval_result = retriever.search_with_query_processing(
            query=question,
            top_k=5,
            candidate_k=20,
        )

        documents = retrieval_result["documents"]
        print("Retrieved documents:", len(documents))

        result = generator.generate(
            question=question,
            documents=documents,
        )

        print("Generated answer:")
        print(result["answer"])

        print("Citations:", result.get("citations", []))
        print("Invalid citations:", result.get("invalid_citations", []))

        if documents:
            assert result["answer"].strip(), (
                "Expected a non-empty answer when documents are retrieved."
            )
        else:
            assert "could not find sufficient supporting information" in (
                result["answer"].lower()
            ), "Expected a safe fallback when no documents are retrieved."

    print("\nRAG RELEVANCE AND GENERATION TESTS COMPLETED")


if __name__ == "__main__":
    main()
