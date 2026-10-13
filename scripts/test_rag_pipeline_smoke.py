import json, sys
from pathlib import Path
from backend.app.rag.pipeline import RAGPipeline

PROJECT_ROOT = Path(__file__).resolve().parents[1]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
    
def main():
    pipeline = RAGPipeline()
    
    question = "A customer's UPI payment failed. What troubleshooting steps should support follow?"
    
    print("=" * 70)
    print("ENTERPRISE COPILOT: REAL RAG PIPELINE SMOKE TEST")
    print("=" * 70)
    print(f"\nQuestion: {question}")
    
    result = pipeline.run(
        question = question,
        top_k = 5,
        candidate_k = 20
    )
    
    print("\n" + "=" * 70)
    print("GENERATED ANSWER")
    print("=" * 70)
    print(result["answer"])

    print("\n" + "=" * 70)
    print("RETRIEVAL SUMMARY")
    print("=" * 70)
    print(f"Original query: {result['original_query']}")
    print(f"Processed query: {result['processed_query']}")
    print(f"Category: {result['category']}")
    print(f"Retrieved documents: {result['retrieved_document_count']}")

    print("\n" + "=" * 70)
    print("SOURCES")
    print("=" * 70)
    
    for source in result["sources"]:
        print(json.dumps(source, indent = 2, default = str))
        
    print("\n" + "=" * 70)
    print("CITATION VALIDATION")
    print("=" * 70)
    print(f"Citations: {result['citations']}")
    print(f"Invalid citations: {result['invalid_citations']}")
    print(f"Has invalid citations: {result['has_invalid_citations']}")

    print("\n" + "=" * 70)
    print("GROUNDING VALIDATION")
    print("=" * 70)
    print(
        json.dumps(
            result["grounding_results"],
            indent = 2,
            default = str
        )
    )
    
    print("\n" + "=" * 70)
    print("SMOKE TEST SUMMARY")
    print("=" * 70)

    if result["retrieved_document_count"] == 0:
        print("WARNING: No documents retrieved. Check ingestion and retrieval.")
    else:
        print("PASS: The pipeline retrieved context and returned an answer.")

    if result["has_invalid_citations"]:
        print("WARNING: The answer contains invalid citations.")
    elif result["citations"]:
        print("PASS: Citation validation found no invalid citations.")
    else:
        print("WARNING: No citations were returned.")

    print("\nReview grounding results before trusting the answer.")


if __name__ == "__main__":
    main()
