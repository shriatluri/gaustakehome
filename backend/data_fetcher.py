"""
data_fetcher.py - Handles all external API calls for stock data

This module fetches data from:
1. yfinance - stock prices, valuation ratios (PE, PB, beta)
2. RSS feeds - Google News and Reuters for recent news
3. Twitter/X API - social media mentions and sentiment
"""

import yfinance as yf
from datetime import datetime, timedelta
from typing import Dict, List
import logging
import feedparser
from dateutil import parser as date_parser
import requests

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def fetch_yfinance_data(ticker: str, days: int = 7) -> Dict:
    """Fetch stock data from Yahoo Finance."""
    try:
        logger.info(f"Fetching yfinance data for {ticker}")

        stock = yf.Ticker(ticker)
        info = stock.info

        end_date = datetime.now()
        start_date = end_date - timedelta(days=int(days) + 1)
        hist = stock.history(start=start_date, end=end_date)

        if hist.empty:
            raise ValueError(f"No historical data found for {ticker}")

        first_close = hist['Close'].iloc[0]
        last_close = hist['Close'].iloc[-1]
        price_change_pct = ((last_close - first_close) / first_close) * 100

        return {
            "price_change_pct": round(price_change_pct, 2),
            "current_price": round(last_close, 2),
            "forward_pe": info.get("forwardPE"),
            "trailing_pe": info.get("trailingPE"),
            "price_to_book": info.get("priceToBook"),
            "beta": info.get("beta"),
            "market_cap": info.get("marketCap"),
            "company_name": info.get("longName", ticker)
        }
    except Exception as e:
        logger.error(f"Error fetching yfinance data for {ticker}: {str(e)}")
        raise


def fetch_google_news(query: str, days: int = 7) -> List[Dict]:
    """Fetch recent news from Google News RSS feed."""
    try:
        import urllib.parse
        from datetime import timezone
        encoded_query = urllib.parse.quote_plus(query)
        url = f"https://news.google.com/rss/search?q={encoded_query}+when:{days}d&hl=en-US&gl=US&ceid=US:en"

        logger.info(f"Fetching Google News for query: {query}")
        feed = feedparser.parse(url)

        cutoff_date = datetime.now(timezone.utc) - timedelta(days=int(days))
        articles = []

        for entry in feed.entries:
            try:
                if not hasattr(entry, 'published'):
                    continue

                published = date_parser.parse(entry.published)
                # Make timezone-aware if it isn't already
                if published.tzinfo is None:
                    published = published.replace(tzinfo=timezone.utc)
                
                if published < cutoff_date:
                    continue

                source = entry.get('source', {}).get('title', 'Unknown')
                articles.append({
                    "title": entry.title,
                    "link": entry.link,
                    "published": published.isoformat(),
                    "source": source
                })
            except Exception as e:
                logger.warning(f"Error parsing article: {str(e)}")
                continue

        logger.info(f"Found {len(articles)} Google News articles for {query}")
        return articles
    except Exception as e:
        logger.error(f"Error fetching Google News for {query}: {str(e)}")
        return []


def fetch_reuters_news(ticker: str, company_name: str) -> List[Dict]:
    """Fetch news from Reuters RSS feeds and filter by ticker/company."""
    try:
        from datetime import timezone
        feeds = [
            "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best",
            "https://www.reuters.com/rssFeed/businessNews",
            "https://www.reuters.com/rssFeed/technologyNews"
        ]

        logger.info(f"Fetching Reuters news for {ticker}/{company_name}")
        all_articles = []

        for feed_url in feeds:
            try:
                feed = feedparser.parse(feed_url)

                for entry in feed.entries:
                    title_lower = entry.title.lower()
                    description_lower = entry.get('description', '').lower()
                    ticker_lower = ticker.lower()
                    company_lower = company_name.lower()

                    if (ticker_lower in title_lower or ticker_lower in description_lower or
                        company_lower in title_lower or company_lower in description_lower):

                        if not hasattr(entry, 'published'):
                            continue

                        published = date_parser.parse(entry.published)
                        # Make timezone-aware if it isn't already
                        if published.tzinfo is None:
                            published = published.replace(tzinfo=timezone.utc)
                        all_articles.append({
                            "title": entry.title,
                            "link": entry.link,
                            "published": published.isoformat(),
                            "source": "Reuters"
                        })
            except Exception as e:
                logger.warning(f"Error parsing Reuters feed {feed_url}: {str(e)}")
                continue

        logger.info(f"Found {len(all_articles)} Reuters articles for {ticker}")
        return all_articles
    except Exception as e:
        logger.error(f"Error fetching Reuters news: {str(e)}")
        return []


def fetch_twitter_mentions(ticker: str, bearer_token: str, max_results: int = 10) -> List[Dict]:
    """Fetch recent Twitter/X mentions using the Twitter API v2."""
    try:
        logger.info(f"Fetching Twitter mentions for {ticker}")

        url = "https://api.twitter.com/2/tweets/search/recent"
        query = f"({ticker}) lang:en -is:retweet"

        params = {
            "query": query,
            "max_results": max(10, min(max_results, 100)),  # API requires 10-100
            "tweet.fields": "created_at,public_metrics,author_id",
            "expansions": "author_id",
        }

        headers = {"Authorization": f"Bearer {bearer_token}"}
        response = requests.get(url, params=params, headers=headers)

        if response.status_code != 200:
            logger.error(f"Twitter API error: {response.status_code} - {response.text}")
            return []

        data = response.json()
        tweets = []

        if "data" in data:
            for tweet in data["data"]:
                metrics = tweet.get("public_metrics", {})
                tweets.append({
                    "text": tweet["text"],
                    "created_at": tweet["created_at"],
                    "likes": metrics.get("like_count", 0),
                    "retweets": metrics.get("retweet_count", 0),
                    "author_id": tweet.get("author_id"),
                    "tweet_id": tweet["id"]
                })

            tweets.sort(key=lambda t: t["likes"] + t["retweets"], reverse=True)

        logger.info(f"Found {len(tweets)} tweets for {ticker}")
        return tweets[:max_results]  # Return only requested amount
    except Exception as e:
        logger.error(f"Error fetching Twitter mentions for {ticker}: {str(e)}")
        return []
