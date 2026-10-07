import re
from langchain_core.documents import Document

def clean_text(text: str) -> str:
    """    
    Clean extracted PDF text while preserving meaningful content.
    """
    
    ## Normalize line endings
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")
    
    ## Remove excessive spaces
    text = re.sub(r"[ \t]+", " ", text)
    
    ## Collapse excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    
    ## Remove spaces around line breaks
    text = re.sub(r" *\n *", "\n", text)
    
    return text.strip()

def clean_documents(documents: list[Document]) -> list[Document]:
    """
    Clean the content of all loaded documents.
    """
    
    cleaned_docs = []
    
    for document in documents:
        cleaned_txt = clean_text(document.page_content)
        
        if not cleaned_txt:
            continue
        
        document.page_content = cleaned_txt
        cleaned_docs.append(document)
    
    return cleaned_docs    