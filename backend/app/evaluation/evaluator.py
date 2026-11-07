from backend.app.evaluation.retrieval_eval import evaluate_retrieval
from backend.app.evaluation.generation_eval import evaluate_generation

def evaluate_rag_pipeline(
    question: str,
    answer: str,
    retrieved_documents: list,
    relevant_chunk_ids: list[int],
    llm,
    grounding_result: dict | None = None
) -> dict:
    # Evaluate the complete RAG pipeline.

    # Combines:
    # 1. Retrieval evaluation
    # 2. Generation evaluation
    
    if not isinstance(question, str) or not question.strip():
        raise ValueError("Question cannot be empty.")

    if not isinstance(answer, str) or not answer.strip():
        raise ValueError("Generated answer cannot be empty.")
    
    retrieval_results = evaluate_retrieval(
        retrieved_documents = retrieved_documents,
        relevant_chunk_ids = relevant_chunk_ids
    )
    
    generation_results = evaluate_generation(
        question = question,
        answer = answer,
        documents = retrieved_documents,
        llm = llm,
        grounding_result = grounding_result
    )
    
    return{
        "question": question,
        "retrieval": retrieval_results,
        "generation": generation_results["metrics"],
        "details": generation_results["details"]
    }