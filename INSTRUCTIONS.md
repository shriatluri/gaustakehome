# Setup Instructions

Complete guide to running the Gaus Thesis application locally.

## Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 16+** and npm (for frontend)
- **Git** (to clone the repository)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/shriatluri/gaustakehome.git
cd gaustakehome
```

### 2. Backend Setup

#### Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required: Get from https://console.anthropic.com/
ANTHROPIC_API_KEY=your_actual_anthropic_api_key_here

# Optional but recommended: Get from https://developer.twitter.com/
X_BEARER=your_twitter_bearer_token_here
```

**Note:** The app will work without the Twitter API key, but social sentiment analysis will be limited.

#### Start the Backend Server

```bash
python -m uvicorn app:app --reload --port 8080
```

The backend will be running at `http://localhost:8080`

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8080 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Application startup complete.
```

### 3. Frontend Setup

Open a **new terminal window** (keep the backend running).

#### Install Node Dependencies

```bash
cd frontend
npm install
```

#### Start the Development Server

```bash
npm run dev
```

The frontend will be running at `http://localhost:5173`

### 4. Use the Application

1. Open your browser to `http://localhost:5173`
2. Enter any stock ticker (e.g., `AAPL`, `GOOG`, `TSLA`)
3. Select a time period (1D, 5D, 1M, or YTD)
4. Click **Analyze**
5. View the AI-generated catalyst and risk analysis!

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│              Vite + TypeScript + Tailwind CSS                │
│                    http://localhost:5173                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                       │
│                    http://localhost:8080                     │
└─────┬────────────┬────────────┬────────────┬────────────────┘
      │            │            │            │
      ▼            ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ yfinance │ │  Google  │ │ Reuters  │ │   Twitter    │
│   API    │ │   News   │ │   RSS    │ │   API v2     │
└──────────┘ └──────────┘ └──────────┘ └──────────────┘
      │            │            │            │
      └────────────┴────────────┴────────────┘
                   │
                   ▼
           ┌───────────────┐
           │  Claude API   │
           │  (Anthropic)  │
           └───────────────┘
```

## Project Structure

```
gaustakehome/
├── backend/
│   ├── app.py              # FastAPI server & main orchestration
│   ├── data_fetcher.py     # Data aggregation from multiple sources
│   ├── llm_prompts.py      # Claude API integration & prompt engineering
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment variable template
│   ├── .gitignore          # Ignored files
│   └── vercel.json         # Vercel deployment config
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Main application component
│   │   ├── api.ts          # Backend API client
│   │   ├── types.ts        # TypeScript type definitions
│   │   └── components/
│   │       ├── TickerInput.tsx   # Search bar & time period selector
│   │       ├── CatalystCard.tsx  # Sentiment analysis display
│   │       └── RiskCard.tsx      # Risk analysis display
│   ├── package.json        # Node dependencies
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── vercel.json         # Vercel deployment config
│
├── INSTRUCTIONS.md         # This file
├── README.md               # Project overview & features
└── DEPLOYMENT.md           # Vercel deployment guide
```

## Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'anthropic'`

**Solution:** Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

---

**Problem:** `ANTHROPIC_API_KEY not configured`

**Solution:** Create a `.env` file in the `backend/` directory with your API key:
```env
ANTHROPIC_API_KEY=sk-ant-...
```

---

**Problem:** Port 8080 already in use

**Solution:** Kill the existing process:
```bash
lsof -ti :8080 | xargs kill
```

### Frontend Issues

**Problem:** `Module not found` errors

**Solution:** Install dependencies:
```bash
cd frontend
npm install
```

---

**Problem:** Cannot connect to backend

**Solution:** 
1. Ensure backend is running on port 8080
2. Check the console for CORS errors
3. Verify `API_BASE_URL` in `frontend/src/api.ts` is set to `http://localhost:8080`

---

**Problem:** Blank screen after running `npm run dev`

**Solution:** Clear the build cache:
```bash
rm -rf node_modules/.vite
npm run dev
```

## API Keys

### Anthropic (Required)

1. Go to https://console.anthropic.com/
2. Create an account or sign in
3. Navigate to API Keys
4. Create a new key
5. Add to your `.env` file

**Cost:** ~$0.01-0.02 per analysis (uses Claude Sonnet 3.5)

### Twitter API (Optional)

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create a developer account
3. Create a new Project and App
4. Generate a Bearer Token
5. Add to your `.env` file

**Note:** Free tier allows 500k tweets/month

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- **Backend**: Uvicorn watches for file changes automatically
- **Frontend**: Vite's HMR (Hot Module Replacement) updates instantly

### Dark Mode

Toggle dark mode using the moon/sun icon in the top right corner.

### Customizing Time Periods

Edit `frontend/src/components/TickerInput.tsx` to modify the `TIME_PERIODS` array.

### Adjusting LLM Output

Modify prompts in `backend/llm_prompts.py`:
- `generate_catalyst_thesis()` - for sentiment analysis
- `generate_risk_thesis()` - for risk analysis

## Testing

### Test the Backend API Directly

```bash
# Health check
curl http://localhost:8080/

# Analyze a ticker
curl "http://localhost:8080/analyze?ticker=AAPL&days=7"
```

### Test Different Scenarios

- **High volatility stock:** `TSLA`, `NVDA`
- **Stable blue chip:** `AAPL`, `MSFT`, `GOOG`
- **Recent news catalyst:** Search for stocks in the news
- **Different time periods:** Test 1D, 5D, 1M, YTD

## Production Deployment

See `DEPLOYMENT.md` for instructions on deploying to Vercel.

## Support

If you encounter issues not covered here:

1. Check the console logs (both frontend and backend)
2. Verify all environment variables are set correctly
3. Ensure you're using compatible Python and Node versions
4. Check that ports 8080 and 5173 are available

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

