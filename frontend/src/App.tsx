/**
 * App.tsx - Main React Application
 *
 * This is the root component that:
 * 1. Manages application state (loading, data, errors)
 * 2. Orchestrates API calls
 * 3. Renders all child components
 */

import { useState } from 'react';
import { analyzeTicker } from './api';
import type { AnalysisResponse } from './types';
import TickerInput from './components/TickerInput';
import CatalystCard from './components/CatalystCard';
import RiskCard from './components/RiskCard';

function App() {
  // Application state using React hooks
  const [isLoading, setIsLoading] = useState(false);  // Is API request in progress?
  const [data, setData] = useState<AnalysisResponse | null>(null);  // API response data
  const [error, setError] = useState<string | null>(null);  // Error message if request fails
  const [isDarkMode, setIsDarkMode] = useState(false);  // Dark mode toggle

  /**
   * Handle ticker analysis request
   * Called when user clicks "Analyze" button
   */
  const handleAnalyze = async (ticker: string, days: number) => {
    // Reset state
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      // Call API with selected time period
      const response = await analyzeTicker(ticker, days);

      // Update state with response data
      setData(response);

    } catch (err) {
      // Handle errors
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);

    } finally {
      // Always stop loading (whether success or error)
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-[#0a0a0a]' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 relative">
          {/* Dark mode toggle button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`absolute right-0 top-0 p-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          <h1 className={`text-5xl font-bold mb-3 transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Gaus: Thesis
          </h1>
          <p className={`text-lg mb-1 transition-colors ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Sentiment + Risk Analysis for any Ticker
          </p>
          <p className={`text-sm transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Input any ticker and select a time period to get started
          </p>
        </header>

        {/* Ticker input */}
        <div className="flex justify-center mb-8">
          <TickerInput onAnalyze={handleAnalyze} isLoading={isLoading} isDarkMode={isDarkMode} />
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${
              isDarkMode ? 'border-blue-400' : 'border-blue-600'
            }`}></div>
            <p className={`mt-4 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Analyzing... This may take 10-15 seconds</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className={`border px-4 py-3 rounded-lg mb-8 transition-colors ${
            isDarkMode
              ? 'bg-red-900/30 border-red-500 text-red-300'
              : 'bg-red-100 border-red-400 text-red-700'
          }`}>
            <strong className="font-bold">Error: </strong>
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {data && !isLoading && (
          <div className="animate-fadeIn">
            {/* Company name and metadata */}
            <div className={`text-center mb-8 rounded-lg shadow-sm p-4 transition-colors ${
              isDarkMode
                ? 'bg-gray-900 border border-gray-800'
                : 'bg-white'
            }`}>
              <h2 className={`text-3xl font-bold mb-1 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {data.company_name} ({data.ticker})
              </h2>
              <p className={`text-sm transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {data.days_analyzed}-day analysis • Current price: <span className="font-semibold">${data.price_data.current_price}</span>
              </p>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Catalyst card */}
              <CatalystCard
                bullets={data.catalyst_thesis}
                priceChange={data.price_data.price_change_pct}
                days={data.days_analyzed}
                isDarkMode={isDarkMode}
              />

              {/* Risk card */}
              <RiskCard bullets={data.risk_thesis} riskScore={data.risk_score} isDarkMode={isDarkMode} />
            </div>

            {/* Data sources footer */}
            <div className={`text-center text-xs rounded-lg shadow-sm py-3 transition-colors ${
              isDarkMode
                ? 'bg-gray-900 border border-gray-800 text-gray-400'
                : 'bg-white text-gray-500'
            }`}>
              <p>
                Analysis based on {data.news.length} news articles
                {data.tweets.length > 0 && ` and ${data.tweets.length} tweets`}
              </p>
            </div>
          </div>
        )}

        {/* Empty state (no data yet) */}
        {!data && !isLoading && !error && (
          <div className={`text-center py-12 transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <p className="text-lg">Enter a stock ticker above to get started</p>
            <p className="text-sm mt-2">Try AAPL, TSLA, NVDA, or any other ticker</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
