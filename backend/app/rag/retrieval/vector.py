from langchain_core.documents import Document
from backend.app.db.session import SessionLocal
from backend.app.models import Chunk
from backend.app.rag.embeddings.factory import get_embeddings

def store_chunk(documents: list[Document]) -> int:
    if not documents:
        return 0
    
    embeddings = get_embeddings()
    texts = [document.page_content for document in documents]
    vectors = embeddings.embed_documents(texts)
    records = []
    for doc, vector in zip(documents, vectors):
        metadata = doc.metadata
        
        record = Chunk(
            content = doc.page_content,
            embedding = vector,
            file_name = metadata.get("file_name", "unknown"),
            file_path = metadata.get("file_path", ""),
            document_type = metadata.get("document_type", "unknown"),
            page = metadata.get("page"),
            metadata = metadata
        )
        
        records.append(record)
        
        with SessionLocal() as session:
            session.add_all(records)
            session.commit()
        
        return len(records)