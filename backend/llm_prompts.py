"""
llm_prompts.py - Claude API integration and prompt templates

This module handles all LLM-related logic:
1. Prompt templates for Catalyst and Risk analysis
2. Claude API calls via the Anthropic SDK
3. Formatting data into prompts
"""

from anthropic import Anthropic
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


def generate_catalyst_thesis(
    ticker: str,
    price_change_pct: float,
    days: int,
    news_articles: List[Dict],
    tweets: List[Dict],
    api_key: str
) -> List[Dict]:
    """Generate 3-5 bullet points explaining why a stock moved, with sources."""
    try:
        logger.info(f"Generating catalyst thesis for {ticker}")

        # Format news articles with numbering for reference
        news_bullets = []
        for i, article in enumerate(news_articles[:10], 1):
            news_bullets.append(
                f"[{i}] [{article['source']}] {article['title']} - "
                f"Published: {article['published']}"
            )
        news_text = "\n".join(news_bullets) if news_bullets else "No recent news found."

        # Format tweets
        tweet_bullets = []
        for tweet in tweets[:1]:
            tweet_bullets.append(
                f"- [Likes: {tweet['likes']}, Retweets: {tweet['retweets']}] {tweet['text']}"
            )
        tweet_text = "\n".join(tweet_bullets) if tweet_bullets else "No recent tweets found."

        # Build prompt asking Claude to cite sources
        if not news_bullets and not tweet_bullets:
            prompt = f"""You are a sell-side analyst. {ticker} moved {price_change_pct:+.2f}% over the last {days} days.

No recent news articles were found. Based on general market knowledge, provide 3-5 bullet points explaining possible reasons for this price movement.

Be specific and concrete. Mention macro factors, sector trends, or typical catalysts for this company.

Output format: Return ONLY 3-5 bullet points, one per line.

Catalyst Thesis (3-5 bullets):"""
        else:
            prompt = f"""You are a sell-side analyst. {ticker} moved {price_change_pct:+.2f}% over the last {days} days.

Based ONLY on the news articles and tweets below, extract 3-5 key bullet points that explain this price movement.

IMPORTANT: Cite sources by their numbers (e.g., [1], [2]) after each relevant point.

Be concrete: mention specific events, actors, and timing from the articles.

Output format: Return ONLY 3-5 bullet points with source citations, one per line.
Example: "Product launch announced driving investor optimism [1][3]"

News Articles:
{news_text}

Notable Tweets:
{tweet_text}

Catalyst Thesis (3-5 bullets with citations):"""

        # Call Claude API
        client = Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=600,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}]
        )

        thesis_text = response.content[0].text.strip()

        # Extract bullets with source citations
        bullets_with_sources = []
        for line in thesis_text.split("\n"):
            line = line.strip()
            if line and (line.startswith("-") or line.startswith("•") or line[0].isdigit()):
                clean_line = line.lstrip("-•").lstrip("0123456789.").strip()
                if clean_line:
                    # Extract source citations [1], [2], etc.
                    import re
                    citations = re.findall(r'\[(\d+)\]', clean_line)
                    # Remove citations from text
                    text_without_citations = re.sub(r'\[\d+\]', '', clean_line).strip()

                    # Build sources list
                    sources = []
                    for cite_num in citations:
                        idx = int(cite_num) - 1
                        if 0 <= idx < len(news_articles[:10]):
                            article = news_articles[idx]
                            sources.append({
                                "title": article["title"],
                                "link": article["link"],
                                "source": article["source"]
                            })

                    bullets_with_sources.append({
                        "text": text_without_citations,
                        "sources": sources
                    })

        logger.info(f"Generated {len(bullets_with_sources)} catalyst bullets for {ticker}")
        return bullets_with_sources
    except Exception as e:
        logger.error(f"Error generating catalyst thesis: {str(e)}")
        return [{"text": f"Error generating analysis: {str(e)}", "sources": []}]


def generate_risk_thesis(
    ticker: str,
    price_change_pct: float,
    days: int,
    valuation_data: Dict,
    tweets: List[Dict],
    api_key: str
) -> List[str]:
    """Generate 3-5 bullet points identifying key investment risks."""
    try:
        logger.info(f"Generating risk thesis for {ticker}")

        # Format valuation metrics
        forward_pe = valuation_data.get("forward_pe")
        trailing_pe = valuation_data.get("trailing_pe")
        price_to_book = valuation_data.get("price_to_book")
        beta = valuation_data.get("beta")
        market_cap = valuation_data.get("market_cap")

        market_cap_text = f"${market_cap:,.0f}" if market_cap else "N/A"
        valuation_text = f"""Forward P/E: {forward_pe if forward_pe is not None else 'N/A'}
Trailing P/E: {trailing_pe if trailing_pe is not None else 'N/A'}
Price-to-Book: {price_to_book if price_to_book is not None else 'N/A'}
Beta: {beta if beta is not None else 'N/A'}
Market Cap: {market_cap_text}
Recent {days}-day change: {price_change_pct:+.2f}%"""

        # Sentiment/crowding proxy
        total_tweets = len(tweets)
        total_engagement = sum(t['likes'] + t['retweets'] for t in tweets)
        sentiment_note = f"Social media activity: {total_tweets} tweets, {total_engagement} total engagement (likes + retweets)"

        # Build prompt
        prompt = f"""You are a portfolio risk analyst considering a position in {ticker}.

Given the valuation and risk context below, identify the 3-5 most important risks to be aware of.

Be specific and data-backed. Mention valuation stretch, macro sensitivity, crowding, or any red flags.

Output format: Return ONLY 3-5 bullet points, one per line. No preamble, no conclusion.

Valuation & Risk Metrics:
{valuation_text}

Sentiment/Crowding Proxy:
{sentiment_note}

Risk Thesis (3-5 bullets):"""

        # Call Claude API
        client = Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=500,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}]
        )

        thesis_text = response.content[0].text.strip()

        # Extract bullets
        bullets = []
        for line in thesis_text.split("\n"):
            line = line.strip()
            if line and (line.startswith("-") or line.startswith("•") or line[0].isdigit()):
                clean_line = line.lstrip("-•").lstrip("0123456789.").strip()
                if clean_line:
                    bullets.append(clean_line)

        logger.info(f"Generated {len(bullets)} risk bullets for {ticker}")
        return bullets
    except Exception as e:
        logger.error(f"Error generating risk thesis: {str(e)}")
        return [f"Error generating analysis: {str(e)}"]
