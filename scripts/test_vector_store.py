from pathlib import Path
from backend.app.db.session import SessionLocal
from backend.app.models import Chunk
from backend.app.rag.ingestion.pipeline import ingest_documents
from backend.app.rag.retrieval.vector import store_chunk

DATA_PATH = Path("data/documents")

def main():
    print("=" * 60)
    print("VECTOR STORE TEST")
    print("=" * 60)
    
    print("\n[1] Processing documents...")

    chunks = ingest_documents(str(DATA_PATH))
    
    print(f"Generated chunks: {len(chunks)}")
    
    if not chunks:
        raise RuntimeError("No chunks were generated")
    
    print("\n[2] Generating embeddings and storing...")
    
    stored = store_chunk(chunks)
    print(f"Stored chunks: {stored}")
    
    print("\n[3] Checking database...")

    with SessionLocal() as session:
        count = session.query(Chunk).count()
    
    print(f"Databse chunk count: {count}")
    
    if count == 0:
        raise RuntimeError("No chunks found in database")
    
    print("\n" + "=" * 60)
    print("VECTOR STORE TEST PASSED")
    print("=" * 60)

if __name__ == "__main__":
    main()