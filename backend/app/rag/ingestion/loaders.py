from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document

def load_pdf(file_path: Path) -> list[Document]:
    """
    Load a single PDF and return its pages as LangChain Documents.
    """
    if not file_path.exists():
        raise FileNotFoundError(f"File not found : {file_path}")
    if file_path.suffix.lower() != ".pdf":
        raise ValueError(f"Expected a PDF file, got {file_path}")
    
    loader = PyPDFLoader(str(file_path))
    docs = loader.load()
    return docs

def load_all_pdfs(data_path: str) -> list[Document]:
    """
    Recursively load all PDFs from the given directory.
    """
    root_path = Path(data_path)
    
    if not root_path.exists():
        raise FileNotFoundError(f"Data directory not found: {data_path}")
    
    pdf_files = list(root_path.rglob("*.pdf"))
    
    if not pdf_files:
        raise FileNotFoundError(f"No PDF files found inside: {root_path}")
    
    all_docs = []
    
    for pdf_file in pdf_files:
        documents = load_pdf(pdf_file)
        
        for document in documents:
            document.metadata["file_name"] = pdf_file.name
            document.metadata["file_path"] = str(pdf_file)
        
        all_docs.extend(documents)
    
    return all_docs     