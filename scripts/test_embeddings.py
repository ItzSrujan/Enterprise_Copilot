from backend.app.rag.embeddings.factory import get_embeddings

def main():
    
    embeddings = get_embeddings()
    text = "Customers can request a refund within 7 days."
    vector = embeddings.embed_query(text)
    
    print("Embedding provider loaded successfully.")
    print("Vector type:", type(vector))
    print("Vector dimensions:", len(vector))
    print("First 5 values:", vector[:])


if __name__ == "__main__":
    main()