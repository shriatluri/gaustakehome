/**
 * TypeScript types for API responses
 *
 * These types match the JSON structure returned by our FastAPI backend
 * TypeScript uses these to provide autocomplete and catch errors at compile time
 */

// Individual news article
export interface NewsArticle {
  title: string;
  link: string;
  published: string;  // ISO date string
  source: string;
}

// Individual tweet
export interface Tweet {
  text: string;
  created_at: string;  // ISO date string
  likes: number;
  retweets: number;
  author_id: string;
  tweet_id: string;
}

// Price and valuation data
export interface PriceData {
  current_price: number;
  price_change_pct: number;
  forward_pe: number | null;  // null if not available
  trailing_pe: number | null;
  price_to_book: number | null;
  beta: number | null;
  market_cap: number | null;
}

// Catalyst bullet with sources
export interface CatalystBullet {
  text: string;
  sources: Array<{
    title: string;
    link: string;
    source: string;
  }>;
}

// Complete analysis response from /analyze endpoint
export interface AnalysisResponse {
  ticker: string;
  company_name: string;
  days_analyzed: number;
  price_data: PriceData;
  news: NewsArticle[];
  tweets: Tweet[];
  catalyst_thesis: CatalystBullet[];  // Array of catalyst bullets with sources
  risk_thesis: string[];              // Array of risk bullet points
  risk_score: number;                 // Risk score from 1-10
}
