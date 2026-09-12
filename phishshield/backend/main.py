from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.scan import router

app = FastAPI(
    title="PhishShield",
    description="AI Powered Phishing Detection System",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)

app.include_router(
    router,
    tags=["URL Scanner"]
)


@app.get("/")
def root():

    return {
        "status": "running",
        "service": "PhishShield API"
    }


@app.get("/health")
def health():

    return {
        "healthy": True
    }