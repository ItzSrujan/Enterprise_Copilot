from langchain_core.documents import Document
from rank_bm25 import BM25Okapi

class BM25Retriever:
    def __init__(self, documents: list[Document]):
        self.documents = documents
    
        tokenized_docs = [
            self._tokenize(document.page_content)
            for document in documents
        ]
        
        self.bm25 = BM25Okapi(tokenized_docs)
    
    @staticmethod
    def _tokenize(text: str) -> list[str]:
        return text.lower().split()
    
    def search(
        self,
        query: str,
        k: int = 5 
    ) -> list[Document]:
        
        tokenized_query = self._tokenize(query)
        
        scores = self.bm25.get_scores(tokenized_query)
        
        ranked_indexes = sorted(
            range(len(scores)),
            key = lambda index : scores[index],
            reverse = True
        )[:k]
        
        return [
            self.documents[index]
            for index in ranked_indexes
        ]