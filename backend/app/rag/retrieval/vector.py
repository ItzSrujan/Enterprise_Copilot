from langchain_core.documents import Document
from sqlalchemy import select

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
    
    for docs, vector in zip(documents, vectors):
        metadata = docs.metadata
        
        record = Chunk(
            content = docs.page_content,
            embedding = vector,
            file_name = metadata.get("file_name", "unknown"),
            file_path = metadata.get("file_path", ""),
            document_type = metadata.get("document_type", "unknown"),
            page = metadata.get("page"),
            meta_data = metadata,
        )

        records.append(record)

    with SessionLocal() as session:
        session.add_all(records)
        session.commit()
    
    return len(records)

def similarity_search(
    query: str,
    k: int = 5
) -> list[Document]:
    
    embeddings = get_embeddings()
    query_vector = embeddings.embed_query(query)
    
    with SessionLocal() as session:
        statement = (
            select(Chunk).order_by(
                Chunk.embedding.cosine_distance(query_vector)
            ).limit(k)
        )
        
        results = session.execute(statement).scalars().all()
    
    documents = []
    
    for chunk in results:
        metadata = dict(chunk.meta_data)
        
        metadata["file_name"] = chunk.file_name
        metadata["file_path"] = chunk.file_path
        metadata["document_type"] = chunk.document_type
        metadata["page"] = chunk.page
        metadata["chunk_id"] = chunk.id
        
        documents.append(
            Document(
                page_content = chunk.content,
                metadata = metadata
            )
        )
        
    return documents