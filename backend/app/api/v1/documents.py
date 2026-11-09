from pathlib import Path
from uuid import uuid4
import shutil, hashlib

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from sqlalchemy.exc import IntegrityError
from backend.app.auth.dependencies import get_current_user
from backend.app.auth.permissions import require_roles
from backend.app.auth.roles import UserRole
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.schemas.document import DocumentResponse, AdminStatsResponse
from backend.app.services.document_service import (
    create_document,
    ingest_document,
    get_document,
    list_documents,
    delete_document,
    get_admin_document_stats,
)
from sqlalchemy.exc import IntegrityError
from backend.app.models.document import Document

router = APIRouter(prefix="/documents", tags=["Documents"])

DOCUMENT_TYPES = {
    "product_docs",
    "policies",
    "faq",
    "troubleshooting",
}

UPLOAD_DIR = Path("data/documents")

def calculate_upload_hash(file: UploadFile) -> str:
    # Calculate SHA-256 hash of an uploaded file.
    sha256 = hashlib.sha256()
    
    file.file.seek(0)
    
    for chunk in iter(lambda: file.file.read(8192), b""):
        sha256.update(chunk)
        
    file.file.seek(0)
    
    return sha256.hexdigest()

@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)
def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if document_type not in DOCUMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid document type.",
        )

    if not file.filename or Path(file.filename).suffix.lower() != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed.",
        )

    original_name = Path(file.filename).name

    content_hash = calculate_upload_hash(file)
    
    existing_document = (
        db.query(Document)
        .filter(Document.content_hash == content_hash)
        .first()
    )
    
    if existing_document:
        raise HTTPException(
            status_code = status.HTTP_409_CONFLICT,
            detail = "This document has already been uploaded"
        )

    safe_name = f"{uuid4().hex}_{original_name}"
    destination_dir = UPLOAD_DIR / document_type
    destination_dir.mkdir(parents=True, exist_ok=True)

    file_path = destination_dir / safe_name

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        document = create_document(
            db=db,
            file_name=original_name,
            file_path=str(file_path),
            document_type=document_type,
            uploaded_by=current_user.id,
            content_hash = content_hash
        )

        try:
            document = ingest_document(db, document)
        except Exception:
            # The service records the failed ingestion status.
            document = get_document(db, document.id)

        return document
    
    except IntegrityError as exc:
        db.rollback()
        
        if file_path.exists():
            file_path.unlink()
        
        existing_document = (
            db.query(Document)
            .filter(Document.content_hash == content_hash)
            .first()
        )
        
        if existing_document:
            raise HTTPException(
                status_code = status.HTTP_409_CONFLICT,
                detail = "This document has already been uploaded"
            ) from exc
        
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = "Document upload failed"
        ) from exc

    except Exception as exc:
        db.rollback()
        
        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = "Document upload failed.",
        ) from exc

    finally:
        file.file.close()


@router.get(
    "/stats",
    response_model=AdminStatsResponse,
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)
def get_admin_stats(
    db: Session = Depends(get_db),
):
    return get_admin_document_stats(db)


@router.get(
    "",
    response_model=list[DocumentResponse],
    dependencies=[Depends(require_roles(UserRole.ADMIN, UserRole.EMPLOYEE))],
)
def get_documents(
    db: Session = Depends(get_db),
):
    return list_documents(db)


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    dependencies=[Depends(require_roles(UserRole.ADMIN, UserRole.EMPLOYEE))],
)
def get_document_details(
    document_id: int,
    db: Session = Depends(get_db),
):
    document = get_document(db, document_id)

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    return document


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)
def remove_document(
    document_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_document(db, document_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    return {"message": "Document deleted successfully."}