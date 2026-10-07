from pathlib import Path
from backend.app.rag.ingestion.pipeline import ingest_documents

DATA_PATH = Path("data/documents")

def main():
    chunks = ingest_documents(str(DATA_PATH))
    
    print(f"\nTotal chunks : {len(chunks)}")
    
    print(f"\nFirst document :")
    print(f"-" * 60)
    
    chunk = chunks[1]
    
    print("Content:")
    print(chunk.page_content[:500])

    print("\nMetadata:")
    print(chunk.metadata)

    print("\nChunk length:")
    print(len(chunk.page_content))
    
if __name__ == "__main__":
    main()