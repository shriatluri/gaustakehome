"""
Vercel serverless function entry point
"""
import sys
import os

# Add parent directory to path so we can import app, data_fetcher, llm_prompts
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from mangum import Mangum
from app import app

# Wrap FastAPI app with Mangum for Vercel serverless compatibility
handler = Mangum(app, lifespan="off")
