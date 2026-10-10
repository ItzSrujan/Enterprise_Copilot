from backend.app.rag.citations.extractor import extract_citations

def validate_citations(
    answer: str,
    sources: list[dict],
) -> dict:
    """Check whether cited source IDs exist in the supplied sources."""
    
    cited_ids = extract_citations(answer)
    
    available_ids = {
        source["source_id"]
        for source in sources
        if isinstance(source.get("source_id"), str)
    }
    
    valid_citations = [
        citation for citation in cited_ids if citation in available_ids
    ]
    
    invalid_citations = [
        citation for citation in cited_ids if citation not in available_ids
    ]
    
    return{
        "citations": valid_citations,
        "invalid_citations": invalid_citations,
        "has_invalid_citations": bool(invalid_citations)
    }