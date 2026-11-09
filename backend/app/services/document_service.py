from pathlib import Path

from sqlalchemy import select, delete
from sqlalchemy.orm import Session

from backend.app.models.document import Document
from backend.app.models.chunk import Chunk

from backend.app.rag.ingestion.loaders import load_pdf
from backend.app.rag.ingestion.cleaner import clean_documents
from backend.app.rag.ingestion.metadata import enrich_metadata
from backend.app.rag.ingestion.chunker import chunk_documents
from backend.app.rag.retrieval.vector import store_chunk

def create_document(
    db: Session,
    file_name: str,
    file_path: str,
    document_type: str,
    uploaded_by: int,
    content_hash: str
) -> Document:

    document = Document(
        file_name=file_name,
        file_path=file_path,
        document_type=document_type,
        uploaded_by=uploaded_by,
        content_hash = content_hash,
        status="pending",
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document

def ingest_document(
    db: Session,
    document: Document,
) -> Document:

    try:
        document.status = "processing"
        document.error_message = None
        db.commit()

        # Load only the newly uploaded PDF
        documents = load_pdf(Path(document.file_path))

        # Clean extracted text
        documents = clean_documents(documents)

        # Attach document metadata
        for item in documents:
            item.metadata["file_path"] = document.file_path
            item.metadata["file_name"] = document.file_name
            item.metadata["document_type"] = document.document_type

        # Split into retrieval-friendly chunks
        chunks = chunk_documents(documents)

        # Store chunks and embeddings in PostgreSQL
        chunk_count = store_chunk(chunks)

        if chunk_count == 0:
            raise ValueError("No chunks were generated from the PDF.")

        document.chunk_count = chunk_count
        document.status = "completed"

        db.commit()
        db.refresh(document)

        return document

    except Exception as exc:
        db.rollback()

        document = db.get(Document, document.id)

        if document is not None:
            document.status = "failed"
            document.error_message = str(exc)[:2000]
            db.commit()
            db.refresh(document)

        raise

def get_document(
    db: Session,
    document_id: int,
) -> Document | None:

    return db.get(Document, document_id)


def list_documents(
    db: Session,
) -> list[Document]:

    statement = select(Document).order_by(
        Document.created_at.desc()
    )

    return list(db.execute(statement).scalars().all())

def delete_document(
    db: Session,
    document_id: int,
) -> bool:

    document = db.get(Document, document_id)

    if document is None:
        return False

    file_path = document.file_path

    try:
        # Remove associated vector chunks
        db.execute(
            delete(Chunk).where(Chunk.file_path == file_path)
        )

        # Remove document record
        db.delete(document)
        db.commit()

        # Remove physical file after successful database commit
        path = Path(file_path)

        if path.exists():
            path.unlink()

        return True

    except Exception:
        db.rollback()
        raise


def get_admin_document_stats(db: Session) -> dict:
    from sqlalchemy import func
    from backend.app.models.user import User

    total_docs = db.query(func.count(Document.id)).scalar() or 0
    processed_docs = db.query(func.count(Document.id)).filter(Document.status == "completed").scalar() or 0
    failed_docs = db.query(func.count(Document.id)).filter(Document.status == "failed").scalar() or 0
    processing_docs = db.query(func.count(Document.id)).filter(Document.status == "processing").scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_chunks = db.query(func.count(Chunk.id)).scalar() or 0

    cat_counts = (
        db.query(
            Document.document_type,
            func.count(Document.id),
            func.coalesce(func.sum(Document.chunk_count), 0),
        )
        .group_by(Document.document_type)
        .all()
    )
    category_distribution = [
        {"category": cat, "count": int(count), "chunks": int(chunks)}
        for cat, count, chunks in cat_counts
    ]

    recent_stmt = select(Document).order_by(Document.created_at.desc()).limit(10)
    recent_docs = list(db.execute(recent_stmt).scalars().all())

    return {
        "total_documents": int(total_docs),
        "processed_documents": int(processed_docs),
        "failed_documents": int(failed_docs),
        "processing_documents": int(processing_docs),
        "total_users": int(total_users),
        "total_chunks": int(total_chunks),
        "category_distribution": category_distribution,
        "recent_documents": recent_docs,
    }