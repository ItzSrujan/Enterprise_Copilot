from backend.app.rag.chains import build_generation_chain
from backend.app.rag.prompts import RAG_PROMPT
from backend.app.rag.generation.llm import OpenRouterLLM
from backend.app.rag.citations.validator import validate_citations
from backend.app.rag.citations.grounding import validate_citation_grounding

class RAGGenerator:
    """Generate grounded answers from retrieved documents."""
    def __init__(self) -> None:
        self.llm = OpenRouterLLM().llm
        
        self.chain = build_generation_chain(
            prompt = RAG_PROMPT,
            llm = self.llm  
        )
        
    @staticmethod
    def prepare_context(documents) -> tuple[str, list[dict]]:
        context_parts = []
        sources = []
        
        for index, document in enumerate(documents, start = 1):
            source_id = f"S{index}"
            metadata = document.metadata
            
            file_path = (
                metadata.get("file_path")
                or metadata.get("source")
                or "UNknown source"
            )
            
            page = metadata.get("page")
            page_number = page + 1 if isinstance(page, int) else None
            
            context_parts.append(
                f"[{source_id}]\n"
                f"Source: {file_path}\n"
                f"Page: {page_number or 'Unknown'}"
                f"Content: \n{document.page_content}"
            )
            
            sources.append(
                {
                    "source_id": source_id,
                    "file_path": file_path,
                    "file_name": metadata.get("file_name"),
                    "page": page_number
                }
            )
        
        return "\n\n".join(context_parts), sources

    def generate(self, question: str, documents) -> dict:
        if not question.strip():
            raise ValueError("Question must not be empty")
        
        if not documents:
            return{
                "answer": "I could not find sufficient supporting information in the available documents.",
                "sources": [],
            }
        context, sources = self.prepare_context(documents)
        
        answer = self.chain.invoke(
            {
                "context": context,
                "question": question
            }
        )
        
        citations_result = validate_citations(
            answer = answer,
            sources = sources
        )
        
        grounding_result = validate_citation_grounding(
            answer = answer,
            documents = documents,
            llm = self.llm
        )
        
        print("Citations:", citations_result["citations"])
        print("Invalid citations:", citations_result["invalid_citations"])
        print("Has invalid citations:", citations_result["has_invalid_citations"])

        return{
            "answer": answer,
            "sources": sources,
            "citations": citations_result["citations"],
            "invalid_citations": citations_result["invalid_citations"],
            "has_invalid_citations": citations_result["has_invalid_citations"],
            "grounding_results": grounding_result
        }