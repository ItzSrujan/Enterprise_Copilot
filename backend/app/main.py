from fastapi import FastAPI
from backend.app.api.router import api_router

app = FastAPI(
    title = "Enterprise Knowledge & Support Copilot",
    description="An enterprise support assistant powered by RAG and LangChain.",
    version="1.0.0"
)

app.include_router(api_router, prefix = "/api/v1")

@app.get("/", tags = ["Root"])
def root():
    return {
        "message": "Enterprise Knowledge & Support Copilot API",
        "status": "running"
    }