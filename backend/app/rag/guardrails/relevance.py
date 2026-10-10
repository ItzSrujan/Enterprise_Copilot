from langchain_core.documents import Document

def filter_relevant_documents(
    documents: list[Document],
    min_score: float
) -> list[Document]:
    """
    Keep documents whose cross-encoder score meets the threshold.

    Note: min_score must be calibrated for the configured reranker.
    """
    relevant_documents = []
    
    for document in documents:
        score = document.metadata.get("reranker_score")
        
        if not isinstance(score, (int, float)):
            continue
        
        if score >= min_score:
            relevant_documents.append(document)
    
    return relevant_documents

def has_sufficient_context(
    documents: list[Document],
    min_documents: int = 1
) -> bool:
    """Return whether enough relevant documents remain.""" 
    if min_documents < 1:
        raise ValueError("min_documents must be at least 1.")
    
    return len(documents) >= min_documents