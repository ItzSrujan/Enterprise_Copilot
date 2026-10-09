from langchain_core.documents import Document

def filter_documents(
    documents: list[Document],
    doc_type: str | None = None,
    file_name: str | None = None
) -> list[Document]:
    filtered = documents
    
    if doc_type:
        filtered = [
            document
            for document in filtered
            if document.metadata.get("document_type") == doc_type
        ]
    
    if file_name:
        filtered = [
            document
            for document in filtered
            if document.metadata.get("file_name") == file_name
        ]
    
    return filtered