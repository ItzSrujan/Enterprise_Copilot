import hashlib
from pathlib import Path
from collections import defaultdict

from backend.app.db.session import SessionLocal
from backend.app.models.document import Document

def calculate_file_hash(file_path: Path) -> str:
    """Calculate SHA-256 hash without loading the entire file into memory."""
    sha256 = hashlib.sha256()

    with file_path.open("rb") as file:
        for chunk in iter(lambda: file.read(8192), b""):
            sha256.update(chunk)

    return sha256.hexdigest()


def backfill_document_hashes():
    db = SessionLocal()

    try:
        documents = db.query(Document).all()

        hash_groups = defaultdict(list)
        updated_count = 0
        missing_files = []

        for document in documents:
            file_path = Path(document.file_path)

            if not file_path.exists():
                missing_files.append(document.file_path)
                continue

            content_hash = calculate_file_hash(file_path)

            document.content_hash = content_hash
            hash_groups[content_hash].append(document)

            updated_count += 1

        db.commit()

        duplicates = {
            content_hash: records
            for content_hash, records in hash_groups.items()
            if len(records) > 1
        }

        print("\n========== HASH BACKFILL REPORT ==========")
        print(f"Total documents: {len(documents)}")
        print(f"Successfully updated: {updated_count}")
        print(f"Missing files: {len(missing_files)}")
        print(f"Duplicate groups: {len(duplicates)}")

        if duplicates:
            print("\nExisting duplicate documents:")

            for content_hash, records in duplicates.items():
                print(f"\nHash: {content_hash}")

                for record in records:
                    print(
                        f"  ID: {record.id} | "
                        f"Name: {record.file_name} | "
                        f"Path: {record.file_path}"
                    )

        if missing_files:
            print("\nMissing physical files:")

            for file_path in missing_files:
                print(f"  {file_path}")

        print("\nBackfill completed.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    backfill_document_hashes()