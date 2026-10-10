import re

CITATION_PATTERN = re.compile(r"\[(S\d+)\]")

def extract_citations(answer: str) -> list[str]:
    """
    Extract unique citation IDs in the order they appear.
    Example: '[S1] ... [S2] ... [S1]' -> ['S1', 'S2']
    """
    if not answer:
        return []
    
    matches = CITATION_PATTERN.findall(answer)
    
    # Remove duplicate while preservingp order.
    return list(dict.fromkeys(matches))