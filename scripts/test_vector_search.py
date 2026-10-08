from backend.app.rag.retrieval.vector import similarity_search

def main():
    query = "Why did the customer's payment fail?"
    
    print("=" * 70)
    print("VECTOR SIMILARITY SEARCH TEST")
    print("=" * 70)
    
    print(f"\nQuery: {query}")
    
    results = similarity_search(
        query = query,
        k = 5
    )
    
    print(f"\nRetrieved documents: {len(results)}")
    
    for index, doc in enumerate(results, start = 1):
        print("\n" + "-" * 50)
        print(f"Result #{index}#")
        
        print(f"File: {doc.metadata.get('file_name')}")
        print(f"Page: {doc.metadata.get('page')}")
        print(
            f"Document type: "
            f"{doc.metadata.get('document_type')}"
        )
        
        print("\nContent")
        print(doc.page_content[:1000])
    
    print("\n" + "=" * 50)
    print("VECTOR SEARCH TEST COMPLETED")
    print("=" * 50)

if __name__ == "__main__":
    main()