from abc import ABC, abstractmethod
from langchain_core.documents import Document

class BaseReranker(ABC):
    @abstractmethod
    def rerank(
        self,
        query: str,
        documents: list[Document],
        top_n: int = 5
    ) -> list[Document]:
        """
        Return documents ranked by relevance to the query
        """
        raise NotImplementedError