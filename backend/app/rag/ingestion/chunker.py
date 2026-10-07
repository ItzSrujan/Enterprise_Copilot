from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_documents(
    documents: list[Document],
    chunk_size: int = 600,
    chunk_overlap: int = 100
) -> list[Document]:
    """
    Split documents into smaller retrieval-friendly chunks.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size = chunk_size,
        chunk_overlap = chunk_overlap,
        separators = [
            "\n\n",
            "\n",
            ". ",
            " ",
            ""
        ]
    )
    
    chunks = splitter.split_documents(documents)
    
    return chunks