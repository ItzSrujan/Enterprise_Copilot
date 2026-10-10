from collections import defaultdict
from langchain_core.documents import Document

def _document_key(doc: Document) -> str:
    """Create a consistent identity across vector and BM25 results."""
    metadata = doc.metadata

    file_path = (
        metadata.get("file_path")
        or metadata.get("source")
        or ""
    )
    file_path = str(file_path).replace("/", "\\").casefold()

    page = metadata.get("page", "")
    content = " ".join(doc.page_content.split())

    return f"{file_path}|{page}|{content}"

def reciprocal_rank_fusion(
    result_lists: list[list[Document]],
    k: int = 60
) -> list[Document]:
    if k <= 0:
        raise ValueError("K must be positive")
    
    scores: dict[str, float] = defaultdict(float)
    docs_by_key: dict[str, Document] = {}
    
    for results in result_lists:
        seen_in_list: set[str] = set()
        
        for rank, doc in enumerate(results, start = 1):
            """Use source + page + content to identify the same chunk
            across retrieval methods."""
            key = _document_key(doc)
            # Prevent one retriever from scoring the same chunk twice.   
            if key in seen_in_list:
                continue
            
            seen_in_list.add(key)
            
            # RRF score
            scores[key] += 1.0/ (k + rank)
            
            # Keep the document representation for the final result.
            if key not in docs_by_key:
                docs_by_key[key] = doc
    
    ranked_keys = sorted(
        scores,
        key = lambda key: scores[key],
        reverse = True
    )
    return [docs_by_key[key] for key in ranked_keys]