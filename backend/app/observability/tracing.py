from langsmith import traceable

def trace_rag_component(
    name: str,
    run_type: str = "chain",
    tags: list[str] | None = None
):
    
    """
    Decorator factory for tracing individual RAG components.

    Args:
        name: Name displayed in LangSmith.
        run_type: LangSmith execution type.
        tags: Optional tags for filtering traces.

    Returns:
        A LangSmith traceable decorator.
    """
    
    component_tags = ["rag"]
    
    if tags:
        component_tags.extend(tags)
        
    return traceable(
        name = name,
        run_type = run_type,
        tags = component_tags
    )