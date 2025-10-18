"""
Vercel serverless function entry point
"""
import sys
import os

# Add parent directory to path so we can import app, data_fetcher, llm_prompts
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from mangum import Mangum
from app import app

# Create handler - Mangum wraps FastAPI for serverless
handler = Mangum(app, lifespan="off")