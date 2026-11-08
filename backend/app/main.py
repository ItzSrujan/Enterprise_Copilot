from fastapi import FastAPI
from backend.app.api.router import api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title = "Enterprise Knowledge & Support Copilot",
    description="An enterprise support assistant powered by RAG and LangChain.",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix = "/api/v1")

@app.get("/", tags = ["Root"])
def root():
    return {
        "message": "Enterprise Knowledge & Support Copilot API",
        "status": "running"
    }