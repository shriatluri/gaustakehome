"""
Vercel serverless function entry point
"""
from mangum import Mangum
from app import app

# Wrap FastAPI app with Mangum for Vercel serverless compatibility
handler = Mangum(app, lifespan="off")

