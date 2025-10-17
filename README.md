# Gaus: Thesis - AI Stock Analysis

An AI-powered stock analysis tool that provides **Catalyst** and **Risk** insights for any ticker using Claude 4.5 Sonnet.

## What It Does

Enter a stock ticker (e.g., AAPL, TSLA) and get:
1. **Catalyst Summary** - 3-5 bullets explaining *why* the stock moved recently (based on news + social media)
2. **Risk Analysis** - 3-5 bullets highlighting key investment risks (valuation, volatility, sentiment)

## Tech Stack

**Backend:**
- FastAPI (Python) - API server
- yfinance - Stock data & metrics
- Google News RSS + Reuters - News articles
- Twitter API v2 - Social mentions
- Claude 4.5 Sonnet - LLM analysis

**Frontend:**
- React + TypeScript
- Tailwind CSS
- Vite

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Your API keys are already in .env

# Run the server
python app.py
```

Backend will run on `http://localhost:8080`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (already done)
# npm install

# Run the dev server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 3. Test It

1. Open http://localhost:5173 in your browser
2. Enter a ticker (try `AAPL`, `TSLA`, `NVDA`)
3. Click "Analyze"
4. Wait 10-15 seconds for analysis

## Project Structure

```
/backend
  app.py              # FastAPI server & main endpoint
  data_fetcher.py     # yfinance, RSS, Twitter API calls
  llm_prompts.py      # Claude API integration
  requirements.txt    # Python dependencies
  .env                # API keys (DO NOT COMMIT)

/frontend
  /src
    App.tsx           # Main React component
    api.ts            # Backend API client
    types.ts          # TypeScript interfaces
    /components
      TickerInput.tsx
      CatalystCard.tsx
      RiskCard.tsx
  tailwind.config.js
```

## How It Works

1. **User input** → Ticker symbol (e.g., "AAPL")
2. **Backend fetches:**
   - Price data & valuation metrics (yfinance)
   - Recent news (Google News + Reuters RSS)
   - Social mentions (Twitter API)
3. **LLM analysis:**
   - Catalyst prompt: "Why did it move?" (news + tweets → bullets)
   - Risk prompt: "What could go wrong?" (valuation + volatility → bullets)
4. **Frontend displays:**
   - Two cards with catalyst & risk bullets
   - Price change indicator
   - Data source counts

## API Endpoints

**GET** `/analyze?ticker=AAPL&days=7`

Returns:
```json
{
  "ticker": "AAPL",
  "company_name": "Apple Inc.",
  "price_data": { "current_price": 175.43, "price_change_pct": 2.5, ... },
  "news": [...],
  "tweets": [...],
  "catalyst_thesis": ["Bullet 1", "Bullet 2", ...],
  "risk_thesis": ["Bullet 1", "Bullet 2", ...]
}
```

## Key Implementation Details

### Data Sources (All Free)
- **yfinance** - Price, PE ratios, beta, market cap
- **Google News RSS** - `https://news.google.com/rss/search?q=TICKER+when:7d`
- **Reuters RSS** - Business/tech feeds, filtered by ticker
- **Twitter API v2** - Recent search, English only, top by engagement (limited to 1 tweet per query to conserve free tier)

### LLM Prompts
- **Catalyst**: "You are a sell-side analyst. [TICKER] moved X% over Y days. Use the news/tweets below and infer the 3-5 most likely catalysts. Be concrete (events/actors/timing)."
- **Risk**: "You are a portfolio risk analyst. Given valuation metrics and sentiment, list 3-5 data-backed risks."

### Error Handling
- Invalid ticker → 404 with clear message
- Missing news → LLM works with available data
- API rate limits → Graceful degradation

## What I Would Build Next

1. **Caching** - Store recent analyses (avoid re-fetching)
2. **Historical comparison** - "How does this compare to last quarter?"
3. **Export PDF** - Share analysis as a report
4. **SPY comparison** - "Is this outperforming the market?"
5. **Insider trading alerts** - Scrape OpenInsider for clusters

## Challenges & Solutions

### Challenge 1: Token Limits
- **Problem**: Feeding 100+ news articles to Claude would exceed token limits
- **Solution**: Prioritized top 10 news + top 5 tweets by engagement

### Challenge 2: Slow RSS Feeds
- **Problem**: Reuters feeds can take 3-5 seconds each
- **Solution**: Could parallelize with `asyncio` in production

### Challenge 3: Missing Data
- **Problem**: Some tickers don't have forward PE or beta
- **Solution**: Used `.get()` with None defaults, LLM handles "N/A" gracefully

## Time Spent
- Backend (data + LLM): ~90 min
- Frontend (React + Tailwind): ~60 min
- Testing & polish: ~30 min
- **Total**: ~3 hours

## Notes
- Twitter API is optional (works without it, just less social context)
- **Tweet limit**: Set to 1 tweet per query to conserve free tier (100 reads/month = ~100 analyses)
- Claude API key is required (no fallback)
- Free tier limits: 100 reads/month (Twitter Basic), standard rate limits (Claude)
