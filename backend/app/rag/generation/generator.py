from collections.abc import Sequence

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

    @staticmethod
    def format_conversation_history(
        conversation_history: Sequence[dict[str, str]] | None
    ) -> str:
        if not conversation_history:
            return "No previous conversation."
        
        history_parts = []
        
        for message in conversation_history:
            role = message.get("role")
            content = message.get("content", "").strip()
            
            if role not in {"user", "assistant"} or not content:
                continue
            
            speaker = "User" if role == "user" else "Assistant"
            history_parts.append(f"{speaker}: {content}")
        
        if not history_parts:
            return "No previous conversation"
        
        return "\n".join(history_parts)

    def generate(
        self,
        question: str,
        documents,
        conversation_history: Sequence[dict[str, str]] | None = None    
    ) -> dict:
        if not question.strip():
            raise ValueError("Question must not be empty")
        
        if not documents:
            return{
                "answer": "I could not find sufficient supporting information in the available documents.",
                "sources": [],
            }
        context, sources = self.prepare_context(documents)
        
        formatted_history = self.format_conversation_history(
            conversation_history
        )
        
        answer = self.chain.invoke(
            {
                "context": context,
                "question": question,
                "conversation_history": formatted_history
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