# Enterprise Knowledge & Support Copilot Seed Data

Synthetic enterprise dataset for the production-oriented RAG project.

Formats:
- PDF: product documentation, policies, FAQ, troubleshooting runbooks
- JSON: FAQ and evaluation data
- CSV: historical support tickets

Recommended ingestion:
PDF -> PyPDFLoader -> cleaning -> RecursiveCharacterTextSplitter -> metadata -> Hugging Face embeddings -> PostgreSQL + pgvector.

Preserve PDF page metadata for citations such as:
Source: refund_policy.pdf, Page 2

All business content and ticket data are synthetic.
