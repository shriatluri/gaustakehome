"""
Vercel serverless function entry point
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mangum import Mangum
from app import app

# Create handler - Mangum wraps FastAPI for serverless
handler = Mangum(app, lifespan="off")

