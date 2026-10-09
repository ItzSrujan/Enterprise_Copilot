from pathlib import Path
from langchain_core.documents import Document
from backend.app.rag.ingestion.pipeline import ingest_documents
from backend.app.rag.retrieval.bm25 import BM25Retriever
from backend.app.rag.retrieval.fusion import reciprocal_rank_fusion
from backend.app.rag.retrieval.vector import similarity_search

class HybridRetriever:
    def __init__(self, data_path: str = "data/documents"):
        # Used to build the in-memory BM25 index
        self.documents = ingest_documents(data_path)
        self.bm25_retriever = BM25Retriever(self.documents)
        
    def search(
        self,
        query: str,
        k: int = 5,
        candidate_k: int = 20
    ) -> list[Document]:
        vector_results = similarity_search(
            query = query,
            k = candidate_k
        )
        
        bm25_results = self.bm25_retriever.search(
            query = query,
            k = candidate_k
        )
        
        fused_results = reciprocal_rank_fusion(
            [vector_results, bm25_results]
        )
        
        return fused_results[:k]