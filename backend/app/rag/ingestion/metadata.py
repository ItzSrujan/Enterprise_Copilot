from pathlib import Path
from langchain_core.documents import Document

def get_doc_type(file_path: str) -> str:
    """
    Determine document type from its parent folder.
    """
    path = Path(file_path)
    
    return path.parent.name

def enrich_metadata(documents: list[Document]) -> list[Document]:
    """
    Add application-specific metadata to documents.
    """
    
    for document in documents:
        file_path = document.metadata.get("file_path", "")
        document.metadata["document_type"] = get_doc_type(file_path)
        document.metadata["file_name"] = Path(file_path).name
        
    return documents