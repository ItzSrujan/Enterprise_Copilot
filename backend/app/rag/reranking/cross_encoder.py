from sentence_transformers import CrossEncoder
from langchain_core.documents import Document
from backend.app.core.config import settings
from backend.app.rag.reranking.base import BaseReranker

class CrossEncoderReranker(BaseReranker):
    def __init__(self):
        self.model = CrossEncoder(
            settings.reranker_model,
            device = settings.reranker_device,
            max_length = settings.reranker_max_length
        )
        
    def rerank(
        self,
        query: str,
        documents: list[Document],
        top_n: int = 5
    ) -> list[Document]:
        if not query.strip() or not documents or top_n <= 0:
            return []
        
        pairs = [
            (query, document.page_content)
            for document in documents
        ]
        
        scores = self.model.predict(
            pairs,
            show_progress_bar = True
        )
        
        ranked = sorted(
            zip(documents, scores),
            key = lambda item: float(item[1]),
            reverse = True
        )
        
        results = []
        
        for document, score in ranked[:top_n]:
            document.metadata["reranker_score"] = float(score)
            results.append(document)
        
        return results
    