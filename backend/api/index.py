"""
Vercel serverless function entry point
This follows Vercel's Python function structure
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import sys
import os

# Add parent directory to path so we can import from backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app import app as main_app
    handler = Mangum(main_app, lifespan="off")
except Exception as e:
    # Fallback: create a simple app that shows the error
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
        return {
            "error": f"Failed to import main app: {str(e)}",
            "message": "Backend initialization error"
        }
    
    handler = Mangum(app, lifespan="off")

