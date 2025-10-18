"""
Test script to verify all imports work
"""
try:
    print("Testing imports...")
    import fastapi
    print("✓ fastapi")
    import yfinance
    print("✓ yfinance")
    import feedparser
    print("✓ feedparser")
    import anthropic
    print("✓ anthropic")
    from mangum import Mangum
    print("✓ mangum")
    
    print("\nAll imports successful!")
    
except Exception as e:
    print(f"❌ Import failed: {e}")
    import traceback
    traceback.print_exc()

