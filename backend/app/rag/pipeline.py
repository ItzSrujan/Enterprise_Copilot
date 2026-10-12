from collections.abc import Sequence
from backend.app.rag.generation.generator import RAGGenerator
from backend.app.rag.retrieval.retriever import DocRetriever

class RAGPipeline:
    """Orchestrate query processing, retrieval, and answer generation."""
    
    def __init__(
        self,
        retriever: DocRetriever | None = None,
        generator: RAGGenerator | None = None
    ) -> None :
        self.retriever = retriever or DocRetriever()
        self.generator = generator or RAGGenerator()
    
    def run(
        self,
        question: str,
        conversation_history: Sequence[dict[str, str]] | None = None,
        top_k: int = 5,
        candidate_k: int = 20,
        document_type: str | None = None,
        file_name: str | None = None
    ) -> dict:
        """Run the complete RAG workflow and return a structured result."""
        
        if not question or not question.strip():
            raise ValueError("Question must not be empty.")
        
        if top_k <= 0 or candidate_k <= 0:
            raise ValueError("top_k and candidate_k must be positive")
        
        # 1. Process the question and retrieve relevant documents.
        retrieval_result = self.retriever.search_with_query_processing(
            query = question,
            conversation_history = conversation_history,
            top_k = top_k,
            candidate_k = candidate_k,
            document_type = document_type,
            file_name = file_name
        )
        
        documents = retrieval_result["documents"]
        processed_query = retrieval_result["processed_query"]
        
        # 2. Generate an answer using the retrieved context.
        # RAGGenerator handles the empty-document fallback.
        generation_result = self.generator.generate(
            question = processed_query,
            documents = documents
        )
        
        # 3. Return a consistent response structure.
        return{
            "original_query": retrieval_result["original_query"],
            "processed_query": processed_query,
            "category": retrieval_result["category"],
            "answer": generation_result["answer"],
            "sources": generation_result.get("sources", []),
            "citations": generation_result.get("citations", []),
            "invalid_citations": generation_result.get(
                "invalid_citations", []
            ),
            "has_invalid_citations": generation_result.get(
                "has_invalid_citations", False
            ),
            "grounding_results": generation_result.get(
                "grounding_results"
            ),
            "retrieved_document_count": len(documents)
        }