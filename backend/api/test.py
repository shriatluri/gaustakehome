"""
Minimal test endpoint to verify Vercel Python runtime works
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "message": "Test endpoint works!"}

@app.get("/health")
def health():
    return {"healthy": True}

handler = Mangum(app, lifespan="off")

