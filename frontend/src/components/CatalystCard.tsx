/**
 * CatalystCard Component
 *
 * Displays the catalyst thesis (why the stock moved) with bullet points and sources
 */

import { useState } from 'react';
import type { CatalystBullet } from '../types';

interface CatalystCardProps {
  bullets: CatalystBullet[];  // Array of catalyst bullets with sources
  priceChange: number;         // Percentage price change
  days: number;                // Number of days analyzed
  isDarkMode: boolean;         // Dark mode state
}

export default function CatalystCard({ bullets, priceChange, days, isDarkMode }: CatalystCardProps) {
  const [showTLDR, setShowTLDR] = useState(false);
  
  const priceIcon = priceChange >= 0 ? '↑' : '↓';
  
  // Simplify financial jargon for beginners
  const simplifyText = (text: string): string => {
    let simplified = text;
    
    // Replace financial terms with plain English
    const replacements: Record<string, string> = {
      'institutional investor': 'large investment firm',
      'institutional': 'large investment',
      'retail investor': 'individual investor',
      'market cap': 'company size',
      'market capitalization': 'company size',
      'P/E ratio': 'price-to-earnings (how expensive the stock is)',
      'forward P/E': 'future price-to-earnings',
      'trailing P/E': 'past price-to-earnings',
      'Price-to-Book': 'price compared to book value',
      'P/B ratio': 'price-to-book value',
      'valuation stretch': 'high stock price',
      'multiple compression': 'price dropping',
      'beta': 'volatility (how much it moves)',
      'macro': 'economy-wide',
      'sentiment': 'investor feeling',
      'bullish': 'positive',
      'bearish': 'negative',
      'catalyst': 'reason for change',
      'headwind': 'challenge',
      'tailwind': 'advantage',
    };
    
    for (const [term, replacement] of Object.entries(replacements)) {
      const regex = new RegExp(term, 'gi');
      simplified = simplified.replace(regex, replacement);
    }
    
    return simplified;
  };

  // Generate TLDR summary as bullet points
  const getTLDRBullets = () => {
    if (bullets.length === 0) return ["No catalyst data available."];
    
    // Take first 2-3 bullets
    return bullets.slice(0, Math.min(3, bullets.length)).map(b => {
      let text = b.text;
      
      // Simplify for beginners
      text = simplifyText(text);
      
      // Find the first complete sentence within reasonable length (100-120 chars)
      const sentences = text.match(/[^.!?]+[.!?]+/g);
      
      if (sentences && sentences.length > 0 && sentences[0] && sentences[0].length <= 120) {
        // Return first complete sentence
        return sentences[0].trim();
      }
      
      // If first sentence is too long, try to cut at a natural break point
      if (text.length > 100) {
        // Look for comma, "and", "or" within first 100 chars
        const breakPoints = [
          text.substring(0, 100).lastIndexOf(', '),
          text.substring(0, 100).lastIndexOf(' and '),
          text.substring(0, 100).lastIndexOf(' or ')
        ];
        
        const bestBreak = Math.max(...breakPoints.filter(p => p > 60));
        
        if (bestBreak > 60) {
          return text.substring(0, bestBreak) + '.';
        }
        
        // Last resort: cut at last space and add period
        const lastSpace = text.substring(0, 100).lastIndexOf(' ');
        return text.substring(0, lastSpace) + '.';
      }
      
      // Short enough, ensure it ends with period
      return text.endsWith('.') || text.endsWith('!') || text.endsWith('?') 
        ? text 
        : text + '.';
    });
  };

  return (
    <div className={`rounded-lg shadow-md p-6 border transition-colors ${
      isDarkMode
        ? 'bg-gray-900 border-gray-800'
        : 'bg-white border-gray-200'
    }`}>
      {/* Card header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-bold transition-colors ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Sentiment Summary
        </h2>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${
          priceChange >= 0 
            ? isDarkMode
              ? 'border-green-600 bg-green-900/30 text-green-400'
              : 'border-green-500 bg-green-50 text-green-700'
            : isDarkMode
              ? 'border-red-600 bg-red-900/30 text-red-400'
              : 'border-red-500 bg-red-50 text-red-700'
        }`}>
          <div className="text-xl font-bold">{priceIcon}</div>
          <div className="text-xl font-bold">{Math.abs(priceChange).toFixed(2)}%</div>
        </div>
      </div>

      {/* Subheader with TLDR button */}
      <div className="flex items-center justify-between mb-4">
        <p className={`text-sm transition-colors ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Explaining the {days}-day price movement
        </p>
        {bullets.length > 0 && (
          <button
            onClick={() => setShowTLDR(!showTLDR)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              isDarkMode
                ? 'bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/50'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            {showTLDR ? 'Show Full' : 'TL;DR'}
          </button>
        )}
      </div>

      {/* Content - TLDR or Full Bullets */}
      {bullets.length > 0 ? (
        showTLDR ? (
          <div className={`border-l-4 p-4 rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-blue-900/20 border-blue-600'
              : 'bg-blue-50 border-blue-500'
          }`}>
            <p className={`font-bold text-base mb-3 transition-colors ${
              isDarkMode ? 'text-blue-400' : 'text-blue-700'
            }`}>TL;DR:</p>
            <ul className="space-y-2">
              {getTLDRBullets().map((bullet, index) => (
                <li key={index} className="flex items-start">
                  <span className={`font-bold mr-2 mt-0.5 transition-colors ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>•</span>
                  <span className={`text-sm leading-relaxed break-words flex-1 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-800'
                  }`}>
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="space-y-4">
            {bullets.map((bullet, index) => (
              <li key={index} className="flex items-start">
                {/* Bullet indicator */}
                <span className={`font-bold mr-3 mt-1 transition-colors ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>•</span>

                <div className="flex-1">
                  {/* Bullet text */}
                  <span className={`leading-relaxed transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {bullet.text}
                  </span>

                  {/* Sources */}
                  {bullet.sources && bullet.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {bullet.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-xs underline transition-colors ${
                            isDarkMode
                              ? 'text-blue-400 hover:text-blue-300'
                              : 'text-blue-600 hover:text-blue-800'
                          }`}
                          title={source.title}
                        >
                          [{source.source}]
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : (
        <p className={`italic transition-colors ${
          isDarkMode ? 'text-gray-500' : 'text-gray-500'
        }`}>
          No catalyst analysis available
        </p>
      )}
    </div>
  );
}
