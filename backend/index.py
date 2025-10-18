"""
Vercel serverless function entry point
"""
from app import app

# Export the FastAPI app directly for Vercel's ASGI support
# Vercel's Python runtime natively supports ASGI applications
handler = app

