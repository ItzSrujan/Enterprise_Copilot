from backend.app.rag.generation.llm import OpenRouterLLM

def main():
    llm = OpenRouterLLM()

    messages = [
        {
            "role": "system",
            "content": "Answer clearly and concisely.",
        },
        {
            "role": "user",
            "content": "Explain what RAG means in two sentences.",
        },
    ]

    answer = llm.generate(messages)

    print("\nGenerated answer:")
    print(answer)

    assert isinstance(answer, str)
    assert answer.strip()

    print("\nHF GENERATION TEST PASSED")


if __name__ == "__main__":
    main()