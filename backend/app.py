"""
app.py - Main FastAPI server

Entry point for the backend. Orchestrates data fetching, LLM calls, and returns JSON.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from dotenv import load_dotenv

from data_fetcher import (
    fetch_yfinance_data,
    fetch_google_news,
    fetch_reuters_news,
    fetch_twitter_mentions
)
from llm_prompts import generate_catalyst_thesis, generate_risk_thesis

# Load environment variables from .env file
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def calculate_risk_score(yfinance_data: dict, price_change_pct: float) -> int:
    """
    Calculate a risk score from 1-10 based on valuation metrics and volatility.
    1-3: Low risk (green)
    4-7: Medium risk (yellow)
    8-10: High risk (red)
    """
    risk_score = 3  # Start at baseline of 3 (moderate risk)
    market_cap = yfinance_data.get("market_cap")
    
    # Factor 1: Forward P/E ratio (-1 to +3 points)
    forward_pe = yfinance_data.get("forward_pe")
    if forward_pe:
        is_mega_cap = market_cap and market_cap > 500_000_000_000
        
        if is_mega_cap:
            # Mega caps: be lenient with P/E (they often have premium valuations)
            if forward_pe > 100:
                risk_score += 3
            elif forward_pe > 70:
                risk_score += 2
            elif forward_pe > 45:
                risk_score += 1
            elif forward_pe < 20:
                risk_score -= 1  # Reward cheap mega caps
        else:
            # Smaller caps: more strict
            if forward_pe > 80:
                risk_score += 3
            elif forward_pe > 50:
                risk_score += 2
            elif forward_pe > 35:
                risk_score += 1
            elif forward_pe < 15:
                risk_score -= 1  # Reward value stocks
    
    # Factor 2: Price-to-Book ratio (0-2 points, very lenient for tech)
    price_to_book = yfinance_data.get("price_to_book")
    if price_to_book:
        if price_to_book > 40:  # Only extreme P/B ratios
            risk_score += 2
        elif price_to_book > 25:
            risk_score += 1
    
    # Factor 3: Beta (volatility) (-1 to +2 points)
    beta = yfinance_data.get("beta")
    if beta:
        if beta > 2.5:
            risk_score += 2
        elif beta > 2.0:
            risk_score += 1
        elif beta < 0.8:
            risk_score -= 1  # Reward low volatility stocks
    
    # Factor 4: Recent price volatility (-1 to +2 points)
    if abs(price_change_pct) > 20:
        risk_score += 2
    elif abs(price_change_pct) > 15:
        risk_score += 1
    elif abs(price_change_pct) < 3:
        risk_score -= 1  # Reward stability
    
    # Factor 5: Market cap - reward large established companies
    if market_cap:
        if market_cap < 1_000_000_000:  # Less than $1B (micro cap)
            risk_score += 3
        elif market_cap < 5_000_000_000:  # Less than $5B (small cap)
            risk_score += 2
        elif market_cap < 20_000_000_000:  # Less than $20B (mid cap)
            risk_score += 1
        elif market_cap > 500_000_000_000:  # Greater than $500B (mega cap)
            risk_score -= 2  # Significant reward for mega caps
        elif market_cap > 100_000_000_000:  # Greater than $100B (large cap)
            risk_score -= 1
    
    # Ensure score is between 1 and 10
    return max(1, min(10, risk_score))

# Create FastAPI app
app = FastAPI(
    title="Gaus Thesis API",
    description="Stock analysis API with catalyst and risk insights",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "message": "Gaus Thesis API is running",
        "endpoints": {
            "/analyze": "GET - Analyze a stock ticker"
        }
    }


@app.get("/analyze")
async def analyze_ticker(
    ticker: str = Query(..., description="Stock ticker symbol (e.g., AAPL, TSLA)"),
    days: int = Query(7, description="Number of days to analyze (default 7)")
):
    """
    Main analysis endpoint.

    Returns:
        JSON with price data, news, tweets, catalyst thesis, and risk thesis
    """
    try:
        logger.info(f"Analyzing ticker: {ticker} for {days} days")

        # Get API keys
        anthropic_api_key = os.environ.get("ANTHROPIC_API_KEY")
        twitter_bearer = os.environ.get("X_BEARER")

        if not anthropic_api_key:
            raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")

        if not twitter_bearer:
            logger.warning("X_BEARER not configured, skipping Twitter data")

        # Fetch stock data
        logger.info(f"[1/5] Fetching yfinance data for {ticker}")
        yfinance_data = fetch_yfinance_data(ticker, days)
        company_name = yfinance_data.get("company_name", ticker)
        price_change_pct = yfinance_data["price_change_pct"]

        # Fetch news
        logger.info(f"[2/5] Fetching Google News for {ticker}")
        google_news = fetch_google_news(f"{ticker} OR {company_name}", days)

        logger.info(f"[3/5] Fetching Reuters news for {ticker}")
        reuters_news = fetch_reuters_news(ticker, company_name)

        all_news = google_news + reuters_news
        all_news.sort(key=lambda x: x['published'], reverse=True)

        # Fetch Twitter mentions
        tweets = []
        if twitter_bearer:
            logger.info(f"[4/5] Fetching Twitter mentions for {ticker}")
            tweets = fetch_twitter_mentions(ticker, twitter_bearer, max_results=1)

        # Generate LLM analysis
        logger.info(f"[5/5] Generating LLM analysis for {ticker}")

        catalyst_bullets = generate_catalyst_thesis(
            ticker=ticker,
            price_change_pct=price_change_pct,
            days=days,
            news_articles=all_news,
            tweets=tweets,
            api_key=anthropic_api_key
        )

        risk_bullets = generate_risk_thesis(
            ticker=ticker,
            price_change_pct=price_change_pct,
            days=days,
            valuation_data=yfinance_data,
            tweets=tweets,
            api_key=anthropic_api_key
        )

        # Calculate risk score
        risk_score = calculate_risk_score(yfinance_data, price_change_pct)
        logger.info(f"Calculated risk score for {ticker}: {risk_score}/10")

        # Build response
        response = {
            "ticker": ticker.upper(),
            "company_name": company_name,
            "days_analyzed": days,
            "price_data": {
                "current_price": yfinance_data["current_price"],
                "price_change_pct": price_change_pct,
                "forward_pe": yfinance_data.get("forward_pe"),
                "trailing_pe": yfinance_data.get("trailing_pe"),
                "price_to_book": yfinance_data.get("price_to_book"),
                "beta": yfinance_data.get("beta"),
                "market_cap": yfinance_data.get("market_cap")
            },
            "news": all_news[:15],
            "tweets": tweets[:1],
            "catalyst_thesis": catalyst_bullets,  # Already formatted with text and sources
            "risk_thesis": risk_bullets,
            "risk_score": risk_score  # 1-10 risk score
        }

        logger.info(f"Analysis complete for {ticker}")
        return response

    except ValueError as e:
        logger.error(f"Invalid ticker {ticker}: {str(e)}")
        raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found or has no data")

    except Exception as e:
        logger.error(f"Error analyzing {ticker}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
