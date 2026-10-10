from langchain_core.output_parsers import StrOutputParser
from backend.app.rag.prompts import RAG_PROMPT
from backend.app.rag.generation.llm import OpenRouterLLM

class RAGGenerator:
    """Generate grounded answers from retrieved documents."""
    def __init__(self) -> None:
        self.llm = OpenRouterLLM().llm
        
        self.chain = (
            RAG_PROMPT | self.llm | StrOutputParser()
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
                "answer":(
                    "I could not find sufficient supporting information in the available documents."
                ),
                "sources": [],
            }
        context, sources = self.prepare_context(documents)
        
        answer = self.chain.invoke(
            {
                "context": context,
                "question": question
            }
        )
        
        return{
            "answer": answer,
            "sources": sources
        }