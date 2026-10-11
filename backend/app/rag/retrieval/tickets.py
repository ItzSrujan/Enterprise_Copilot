import csv
from pathlib import Path
from langchain_core.documents import Document
from backend.app.rag.retrieval.bm25 import BM25Retriever

class TicketRetriever:
    """Retrieve historical support tickets using BM25."""
    
    REQUIRED_COULMNS = {
        "ticket_id",
        "category",
        "issue",
        "resolution",
        "status"
    }
    
    def __init__(
        self,
        csv_path: str = "data/tickets/support_tickets.csv"
    ):
        path = Path(csv_path)
        
        if not path.exists():
            raise FileNotFoundError(
                f"Support ticket file not found: {path}"
            )
            
        self.documents = self._load_tickets(path)
        
        if not self.documents:
            raise ValueError(
                f"No valid tickets found in {path}"
            )
        
        self.bm25_retriever = BM25Retriever(self.documents)
    
    @classmethod
    def _load_tickets(
        cls,
        path: Path
    ) -> list[Document]:
        documents = []
        
        with path.open(
            "r",
            encoding = "utf-8-sig",
            newline = ""
        ) as file:
            reader = csv.DictReader(file)
            columns = set(reader.fieldnames or [])
            missing = cls.REQUIRED_COULMNS - columns
            
            if missing:
                raise ValueError(
                    f"Missing CSV columns: {sorted(missing)}"
                )
            
            for row in reader:
                ticket_id = (row.get("ticket_id") or "").strip()
                issue = (row.get("issue") or "").strip()
                resolution = (row.get("resolution") or "").strip()
                
                if not ticket_id or not issue:
                    continue
                
                # Combine searchable issue and resolution text.
                content = (
                    f"Ticket ID: {ticket_id}\n"
                    f"Category: {row.get('category', '').strip()}\n"
                    f"Status: {row.get('status', '').strip()}\n"
                    f"Issue: {issue}\n"
                    f"Resolution: {resolution}"
                )
                
                documents.append(
                    Document(
                        page_content=content,
                        metadata={
                            "source": str(path),
                            "file_name": path.name,
                            "source_type": "support_ticket",
                            "ticket_id": ticket_id,
                            "category": (
                                row.get("category") or ""
                            ).strip(),
                            "status": (
                                row.get("status") or ""
                            ).strip(),
                        },
                    )
                )
        return documents
    
    def search(
        self,
        query: str,
        k: int = 5
    ) -> list[Document]:
        if not query or not query.strip() or k <= 0:
            return []
        
        return self.bm25_retriever.search(
            query = query,
            k = k
        )