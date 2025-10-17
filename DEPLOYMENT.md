# Vercel Deployment Guide

This guide shows you how to deploy the Gaus Thesis app to Vercel so that **users can use your API keys** (they don't need their own).

## Overview

- **Backend**: FastAPI deployed as serverless functions (uses your API keys)
- **Frontend**: React/Vite app that calls the backend
- Users interact with the frontend, which calls your backend, which uses your API keys

## Step-by-Step Deployment

### 1. Install Vercel CLI (optional but recommended)

```bash
npm install -g vercel
```

### 2. Deploy the Backend

#### Option A: Via Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. **Root Directory**: Set to `backend`
5. Click **"Environment Variables"** and add:
   - `ANTHROPIC_API_KEY` = `your_actual_anthropic_key`
   - `X_BEARER` = `your_actual_twitter_token` (optional)
6. Click **"Deploy"**
7. **Copy the deployment URL** (e.g., `https://your-backend.vercel.app`)

#### Option B: Via CLI

```bash
cd backend
vercel

# When prompted, set environment variables:
vercel env add ANTHROPIC_API_KEY
# Paste your Anthropic API key

vercel env add X_BEARER
# Paste your Twitter bearer token (optional)

# Deploy to production
vercel --prod
```

### 3. Deploy the Frontend

#### Option A: Via Vercel Dashboard

1. Click **"Add New Project"** again
2. Import your GitHub repository (or same repo)
3. **Root Directory**: Set to `frontend`
4. Click **"Environment Variables"** and add:
   - `VITE_API_BASE_URL` = `https://your-backend.vercel.app` (from step 2)
5. Click **"Deploy"**
6. Your app is now live! 🎉

#### Option B: Via CLI

```bash
cd frontend

# Set the backend URL environment variable
vercel env add VITE_API_BASE_URL production
# Paste: https://your-backend.vercel.app

# Deploy
vercel --prod
```

## Environment Variables Summary

### Backend Environment Variables (in Vercel)
```
ANTHROPIC_API_KEY = your_actual_key_here
X_BEARER = your_twitter_token_here (optional)
```

### Frontend Environment Variables (in Vercel)
```
VITE_API_BASE_URL = https://your-backend.vercel.app
```

## How It Works

1. **User visits your frontend** → `https://your-app.vercel.app`
2. **Frontend calls your backend** → `https://your-backend.vercel.app/analyze?ticker=AAPL`
3. **Backend uses YOUR API keys** stored in Vercel environment variables
4. **Backend returns data** to frontend
5. **User sees results** without needing any API keys! ✅

## Security Notes

✅ **Your API keys are safe**:
- Stored securely in Vercel's environment variables
- Never exposed to the browser or users
- Only accessible by your backend code

✅ **Your `.env` file is never committed**:
- Protected by `.gitignore`
- Only used for local development

## Local Development

For local development, keep using:
```bash
# Backend
cd backend
python -m uvicorn app:app --reload --port 8080

# Frontend (in another terminal)
cd frontend
npm run dev
```

The frontend will automatically use `http://localhost:8080` when `VITE_API_BASE_URL` is not set.

## Updating Environment Variables

If you need to rotate your API keys:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Edit the variables
4. Click **"Redeploy"** to apply changes

## Troubleshooting

### CORS Errors
The backend already has CORS configured for all origins. If you want to restrict it to only your frontend domain:

```python
# In backend/app.py, update:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.vercel.app"],  # Restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### API Key Not Working
- Check that environment variables are set in Vercel dashboard
- Ensure there are no extra spaces or quotes around the keys
- Redeploy after changing environment variables

### Frontend Can't Connect to Backend
- Verify `VITE_API_BASE_URL` is set correctly in frontend environment variables
- Make sure the backend URL doesn't have a trailing slash
- Check browser console for CORS errors

