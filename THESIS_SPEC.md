# 🧠 Gaus: **Thesis** — Catalyst + Risk Analyzer (MVP Spec)

This version locks the **free API stack** you chose: **Twitter (X) API + yfinance + RSS news scraping**. No paid news APIs required.

---

## 🔥 Overview

**Thesis** is a lightweight web app that takes a stock or ETF ticker as input and returns:
1. **Catalyst Summary** — *why* the security moved recently (news + socials → TL;DR).
2. **Risk Analyzer** — key risks to know before taking a position (valuation, beta/vol, crowding hooks).

It mimics a financial advisor’s narrative using live data and an LLM prompt. The MVP focuses on **free, reliable sources** and fast iteration.

---

## 🎯 Goal

Deliver a 0→1 feature that outputs **insightful, explainable, actionable** intelligence, not raw charts. Timebox: **3–4 hours** to working demo.

---

## 👤 Target User

- Retail or semi‑active investor seeking context before trading
- Analyst/trader wanting a quick **“read”** on a ticker
- Users who value **sentiment + risk TL;DR** more than raw metrics

---

## 🧭 User Journey

1. User visits web app
2. Enters a **ticker** (e.g., `AAPL`, `ARKK`)
3. Clicks **Analyze**
4. Backend fetches data (RSS news, X mentions, yfinance stats) and builds two LLM prompts
5. App returns:
   - 3–5 bullet **Catalyst Summary**
   - 3–5 bullet **Risk Analysis**
6. Links to source articles and tweet context are shown (when available)

---

## 📦 Features

### 1) 🔍 Catalyst Summary (Last 3–7 Days)
**Purpose:** Connect recent price action to concrete **catalysts**.

**Data Sources (Free):**
- **Google News RSS** search (company name OR ticker):  
  `https://news.google.com/rss/search?q=<QUERY>+when:7d&hl=en-US&gl=US&ceid=US:en`
- **Reuters RSS** (business/tech feeds), filtered by company name/ticker
- **X (Twitter) API v2** recent search — English, non‑retweets

**LLM Output:**
- 3–5 concise bullets
- Name events/actors/timing; include quick price context (“+5% since Mon”)

---

### 2) ⚠️ Risk Analyzer
**Purpose:** TL;DR of **what could go wrong** if entering a trade now.

**Data Sources (Free):**
- **yfinance** for: price history, **% move**, **PE (fwd/trailing)**, **PB**, **beta**, market cap
- (Optional later) add insider clusters via **OpenInsider** scraping

**LLM Output:**
- 3–5 bullets
- Actionable, data‑backed (valuation stretch, beta/macro sensitivity, crowding proxy via social surge), mention IV proxy if available

---

## 📤 User Interface

**Stack:** React + Tailwind (SPA)

**Layout:**
- Title: **Thesis**
- Ticker input + “Analyze” button
- Two cards:
  - **Catalyst Thesis** 💡
  - **Risk Thesis** ⚠️
- Loading state; each bullet may include a “View source” link

---

## 🧠 Prompt Engineering

### Catalyst Prompt
```
You are a sell-side analyst. {TICKER} moved {PCT}% over the last {DAYS} days.

Use the inputs below (headline + timestamp + link, plus notable tweets) and infer the 3–5 most likely catalysts that explain the move. 
Be concrete (events/actors/timing). Bullets only.

News:
{NEWS_BULLETS}

Tweets:
{TWEET_BULLETS}
```

### Risk Prompt
```
You are a portfolio risk analyst considering a position in {TICKER}.
Given valuation and risk context below, list 3–5 concise, data-backed risks.
Bullets only.

Valuation: forwardPE={FWD_PE}, trailingPE={TR_PE}, priceToBook={PB}, marketCap={MCAP}
Volatility/Beta: beta={BETA}, last_{DAYS}_day_change={PCT}%
(If available) Sentiment surge / crowding proxy: {SOCIAL_NOTE}
```

---

## 🧪 Technical Stack

| Layer       | Technology                              |
|------------|------------------------------------------|
| Frontend   | React + Tailwind                         |
| Backend    | **FastAPI (Python)**                     |
| LLM        | OpenAI GPT‑4 (key provided separately)   |
| Data       | **yfinance**, **X (Twitter) API v2**, **RSS (Google News + Reuters)** |
| Hosting    | Local / Vercel (frontend) + Render/Fly (API) |

> Rationale: Python makes **yfinance** + RSS parsing trivial. FastAPI keeps the server tiny and fast.

---

## 🧰 API & Scraper Checklist (Free)

| Task                      | Tool / Endpoint                                                                 |
|---------------------------|----------------------------------------------------------------------------------|
| Price/% change, ratios    | `yfinance.Ticker().info`, `yf.download()`                                       |
| News search (7d window)   | Google News RSS search (see URL above)                                          |
| High‑quality feed         | Reuters RSS (business/tech), then filter by ticker/company                      |
| Social mentions           | **X v2 Recent Search** (`query="(TICKER) lang:en -is:retweet"`)                 |
| Optional insider (later)  | OpenInsider (HTML scrape)                                                        |

**Env Vars:**
```
OPENAI_API_KEY=...
X_BEARER=...              # Twitter API v2 bearer token
```

---

## 🧱 MVP Data Flow

1. **GET** `/analyze?ticker=TSLA&days=7`
2. Server:
   - `yfinance`: compute `% change`, pull `forwardPE`, `trailingPE`, `priceToBook`, `beta`, `marketCap`
   - RSS: fetch Google News search for `"TSLA OR "Tesla, Inc." when:7d"`; fetch Reuters feeds → filter by `TSLA|Tesla`
   - X: recent search for `(TSLA) lang:en -is:retweet` → keep top by likes/retweets
   - Build two prompts (Catalyst, Risk) and call LLM
3. Response JSON:
   - `price_change`, `valuation` snapshot
   - `news[]` (title/link/published_at/source)
   - `twitter[]` (created_at/text/likes/retweets)
   - `catalyst_thesis[]` bullets
   - `risk_thesis[]` bullets
4. React renders two cards with bullets + source links

---

## 🔌 Example FastAPI Route (reference)

See `app.py` (server) for:
- `GET /analyze` (assembles data as above)
- Helpers: RSS parsing, Twitter search, yfinance wrappers

Run:
```bash
pip install fastapi uvicorn feedparser yfinance requests tenacity python-dateutil
export X_BEARER=YOUR_TWITTER_BEARER
export OPENAI_API_KEY=...
uvicorn app:app --reload --port 8080
```

---

## ✅ MVP Acceptance Criteria

- [ ] Input any valid ticker; receive **Catalyst Thesis** + **Risk Thesis**
- [ ] Returns within ~10s with at least 5 news items or a clear “low-news” message
- [ ] Bullets are **specific** (events/actors/timing), not generic
- [ ] Source links included for transparency
- [ ] README with setup + env vars

---

## 🧭 Stretch Ideas (time permitting)

- Stock vs **SPY** divergence explainer
- Export **PDF** memo (“Share Thesis”)
- Add **OpenInsider** clusters to risk/catalyst
- Save query history (+ permalink sharable view)

---

## 📁 File Skeleton (suggested)

```
/thesis
  /api
    app.py                # FastAPI server
    requirements.txt
  /web
    package.json
    src/App.tsx           # React UI
  README.md
  THESIS_SPEC.md          # this file
  .env.example            # OPENAI_API_KEY, X_BEARER
```
