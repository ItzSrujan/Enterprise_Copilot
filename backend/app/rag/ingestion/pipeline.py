from langchain_core.documents import Document
from backend.app.rag.ingestion.loaders import load_all_pdfs
from backend.app.rag.ingestion.cleaner import clean_documents
from backend.app.rag.ingestion.metadata import enrich_metadata
from backend.app.rag.ingestion.chunker import chunk_documents

def ingest_documents(data_path: str) -> list[Document]:
    
    documents = load_all_pdfs(data_path)
    documents = clean_documents(documents)
    documents = enrich_metadata(documents)
    chunks = chunk_documents(documents)
    
    return chunks