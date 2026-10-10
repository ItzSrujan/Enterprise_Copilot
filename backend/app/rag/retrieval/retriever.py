from langchain_core.documents import Document
from backend.app.rag.retrieval.hybrid import HybridRetriever
from backend.app.rag.retrieval.filters import filter_documents
from backend.app.rag.reranking.cross_encoder import CrossEncoderReranker
from backend.app.rag.query.processor import process_query

class DocRetriever:
    def __init__(self, data_path: str = "data/documents"):
        self.hybrid_retriever = HybridRetriever(data_path)
        self.reranker = CrossEncoderReranker()
    
    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        candidate_k: int = 20,
        doc_type: str | None = None,
        file_name: str | None = None
    ) -> list[Document]:
        
        if not query.strip() or top_k <= 0 or candidate_k <= 0:
            return []
        
        # Step 1: Retrieve a broad set of candidates.
        candidates = self.hybrid_retriever.search(
            query = query,
            k = candidate_k,
            candidate_k = candidate_k
        )
        
        # Step 2: Apply optional metadata filters/
        candidates = filter_documents(
            candidates,
            doc_type = doc_type,
            file_name = file_name
        )
        
        if not candidates:
            return []
        
        # Step 3: Rerank candidates using the query and document text.
        ranked_docs = self.reranker.rerank(
            query = query,
            documents = candidates,
            top_n = top_k  
        )
        
        return ranked_docs
    
    def search_with_query_processing(
        self,
        query: str,
        conversation_history: list[dict[str, str]] | None = None,
        top_k: int = 5,
        candidate_k: int = 20,
        document_type: str | None = None,
        file_name: str | None = None
    ) -> dict:
        """Process a query, retrieve relevant documents, and return both."""
        
        if not query or not query.strip():
            raise ValueError("Query must not be empty.")

        if top_k <= 0 or candidate_k <= 0:
            raise ValueError("top_k and candidate_k must be positive.")
        
        query_result = process_query(
            query = query,
            conversation_history = conversation_history
        )
        
        processed_query = query_result["rewritten_query"]
        
        documents = self.retrieve(
            query = processed_query,
            top_k = top_k,
            candidate_k = candidate_k,
            doc_type = document_type,
            file_name = file_name
        )
        
        return{
            "original_query": query_result["original_query"],
            "processed_query": processed_query,
            "category": query_result["category"],
            "documents": documents
        }