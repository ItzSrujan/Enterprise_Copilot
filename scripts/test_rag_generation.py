from backend.app.rag.retrieval.retriever import DocRetriever
from backend.app.rag.generation.generator import RAGGenerator

def main():
    retriever = DocRetriever()
    generator = RAGGenerator()
    
    question = "Why can a UPI payment remain pending?"
    
    retrievel_result = retriever.search_with_query_processing(
        query = question,
        top_k = 5,
        candidate_k = 20
    )
    
    documents = retrievel_result["documents"]
    
    print("Retrieved documents: ", len(documents))
    
    result = generator.generate(
        question = question,
        documents = documents
    )
    
    print("\nGenerated answer: ")
    print(result["answer"])
    
    print("\nSources: ")
    for source in result["sources"]:
        print(source)
    
    assert result["answer"].strip()
    
    print("\nRAG GENERATION TEST COMPLETED")
    
if __name__ == "__main__":
    main()    