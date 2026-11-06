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
) -> Document:

    document = Document(
        file_name=file_name,
        file_path=file_path,
        document_type=document_type,
        uploaded_by=uploaded_by,
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