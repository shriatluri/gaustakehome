# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Gaus: Thesis** is a stock ticker analysis web app that provides:
1. **Catalyst Summary** - explains recent price movements using news/social media
2. **Risk Analyzer** - identifies key investment risks using valuation metrics

This is a take-home project with a **3-4 hour timebox**. The focus is on delivering insightful, LLM-generated analysis (not raw charts/metrics).

## Architecture

### Tech Stack
- **Backend**: FastAPI (Python) - handles all data fetching and LLM orchestration
- **Frontend**: React + Tailwind - simple SPA with ticker input and two result cards
- **LLM**: Claude 4.5 Sonnet (Anthropic API) - generates catalyst and risk bullets
- **Data Sources** (all free):
  - `yfinance` - price data, valuation ratios (PE, PB, beta, market cap)
  - Google News RSS - recent news articles (7-day window)
  - Reuters RSS - high-quality business/tech news feeds
  - Twitter/X API v2 - social sentiment and mentions

### File Structure
```
/backend
  app.py              # Main FastAPI server - all routes and core logic
  data_fetcher.py     # External API calls (yfinance, RSS, Twitter)
  llm_prompts.py      # Prompt templates and Claude API integration
  requirements.txt
  .env.example

/frontend
  /src
    App.tsx           # Main React component
    components/
      TickerInput.tsx
      CatalystCard.tsx
      RiskCard.tsx
    api.ts            # Backend API client
    types.ts
  package.json
  tailwind.config.js
```

### Data Flow
1. User enters ticker → `GET /analyze?ticker=TSLA&days=7`
2. Backend pipeline:
   - Fetch price % change, valuation metrics (yfinance)
   - Fetch news (Google News RSS + Reuters RSS filtered by ticker)
   - Fetch tweets (X API recent search, top by engagement)
   - Build two prompts: **Catalyst** (news+tweets+price context) and **Risk** (valuation+volatility+sentiment)
   - Call Claude API twice (one for each prompt)
3. Return JSON with:
   - `price_change`, `valuation` snapshot
   - `news[]`, `twitter[]` arrays with sources
   - `catalyst_thesis[]`, `risk_thesis[]` - 3-5 bullets each
4. Frontend renders two cards with bullets + source links

## Key Implementation Details

### Backend (`app.py`)
- Main route: `GET /analyze` - orchestrates all data fetching and LLM calls
- Keep everything in one file for MVP simplicity
- Uses `feedparser` for RSS parsing, `requests` for Twitter API
- Error handling: graceful degradation if news/tweets unavailable

### Data Fetcher (`data_fetcher.py`)
- `fetch_yfinance_data(ticker, days)` - returns price change %, PE ratios, beta, market cap
- `fetch_google_news(query, days)` - RSS search for company name/ticker
- `fetch_reuters_news(ticker)` - parse RSS feeds, filter by ticker/company
- `fetch_twitter_mentions(ticker)` - X API v2 recent search, top by likes/retweets

### LLM Prompts (`llm_prompts.py`)
- **Catalyst Prompt**: "You are a sell-side analyst. {TICKER} moved {PCT}% over the last {DAYS} days. Use the inputs below (headline + timestamp + link, plus notable tweets) and infer the 3–5 most likely catalysts that explain the move. Be concrete (events/actors/timing). Bullets only."
- **Risk Prompt**: "You are a portfolio risk analyst considering a position in {TICKER}. Given valuation and risk context below, list 3–5 concise, data-backed risks. Bullets only." (includes forwardPE, trailingPE, priceToBook, beta, recent % change, sentiment surge)
- Use Claude 4.5 Sonnet API with these prompts

### Frontend
- Simple flow: TickerInput → loading state → CatalystCard + RiskCard
- Each bullet may include a "View source" link for transparency
- Tailwind for styling (keep it minimal)

## Environment Variables

Required in `.env`:
```
ANTHROPIC_API_KEY=sk-ant-...    # Claude API key
X_BEARER=...                     # Twitter API v2 bearer token
```

## Running the Project

### Backend
```bash
cd backend
pip install fastapi uvicorn feedparser yfinance requests tenacity python-dateutil anthropic
export ANTHROPIC_API_KEY=your_key
export X_BEARER=your_twitter_bearer
uvicorn app:app --reload --port 8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## MVP Acceptance Criteria
- Input any valid ticker; receive Catalyst + Risk thesis
- Returns within ~10s with at least 5 news items (or clear "low-news" message)
- Bullets are **specific** (events/actors/timing), not generic
- Source links included for transparency

## Important Constraints
- **Free APIs only** - no paid news services
- **3-4 hour timebox** - prioritize working demo over polish
- **Explainable output** - every bullet should be traceable to source data
- **No over-engineering** - keep files simple and single-purpose
