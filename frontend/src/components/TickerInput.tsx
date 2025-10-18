/**
 * TickerInput Component
 *
 * Renders a text input, time period selector, and "Analyze" button
 */

import { useState } from 'react';

interface TickerInputProps {
  onAnalyze: (ticker: string, days: number) => void;  // Callback with ticker and days
  isLoading: boolean;                                  // Whether analysis is in progress
  isDarkMode: boolean;                                 // Dark mode state
}

const TIME_PERIODS = [
  { label: '1D', days: 1 },
  { label: '5D', days: 5 },
  { label: '1M', days: 30 },
  { label: 'YTD', days: -1 }, // Special value for YTD
];

export default function TickerInput({ onAnalyze, isLoading, isDarkMode }: TickerInputProps) {
  const [ticker, setTicker] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(5); // Default to 5D

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTicker = ticker.trim().toUpperCase();

    if (trimmedTicker) {
      // Calculate days for YTD
      let days = selectedPeriod;
      if (days === -1) {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        days = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
      }
      onAnalyze(trimmedTicker, days);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex gap-2 mb-3">
        {/* Input field */}
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Enter ticker (e.g., AAPL)"
          disabled={isLoading}
          className={`flex-1 px-4 py-2 border rounded-lg transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:cursor-not-allowed ${
                       isDarkMode
                         ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 disabled:bg-gray-900'
                         : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100'
                     }`}
        />

        {/* Analyze button */}
        <button
          type="submit"
          disabled={isLoading || !ticker.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium
                     hover:bg-blue-700 focus:outline-none focus:ring-2
                     focus:ring-blue-500 focus:ring-offset-2
                     disabled:bg-gray-400 disabled:cursor-not-allowed
                     transition-colors"
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {/* Time period selector */}
      <div className="flex justify-center gap-1">
        {TIME_PERIODS.map((period) => (
          <button
            key={period.label}
            type="button"
            onClick={() => setSelectedPeriod(period.days)}
            disabled={isLoading}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed
                       ${selectedPeriod === period.days
                         ? 'bg-blue-600 text-white'
                         : isDarkMode
                           ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                           : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                       }`}
          >
            {period.label}
          </button>
        ))}
      </div>
    </form>
  );
}
