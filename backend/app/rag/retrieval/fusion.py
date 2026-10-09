from collections import defaultdict
from langchain_core.documents import Document

def reciprocal_rank_fusion(
    result_lists: list[list[Document]],
    k: int = 60
) -> list[Document]:
    scores: dict[str, float] = defaultdict(float)
    docs_by_key: dict[str, Document] = {}
    
    for results in result_lists:
        seen_in_list: set[str] = set()
        
        for rank, doc in enumerate(results, start = 1):
            """Use source + page + content to identify the same chunk
            across retrieval methods."""
            key = (
                f"{doc.metadata.get('file_path', '')}|"
                f"{doc.metadata.get('page', '')}|"
                f"{doc.metadata}"
            )
            
            if key in seen_in_list:
                continue
            
            seen_in_list.add(key)
            scores[key] += 1.0 / (k + rank)
            docs_by_key[key] = doc
    
    ranked_keys = sorted(
        scores,
        key = lambda key: scores[key],
        reverse = True
    )
    return [docs_by_key[key] for key in ranked_keys]