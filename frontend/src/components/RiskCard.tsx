/**
 * RiskCard Component
 *
 * Displays the risk thesis (investment risks to consider) with bullet points and risk score
 */

import { useState } from 'react';

interface RiskCardProps {
  bullets: string[];   // Array of risk bullet points from LLM
  riskScore: number;   // Risk score from 1-10
  isDarkMode: boolean; // Dark mode state
}

export default function RiskCard({ bullets, riskScore, isDarkMode }: RiskCardProps) {
  const [showTLDR, setShowTLDR] = useState(false);
  
  // Determine color based on risk score
  const getScoreColor = (score: number) => {
    if (score <= 3) {
      return isDarkMode 
        ? 'text-green-400 bg-green-900/30 border-green-600'
        : 'text-green-600 bg-green-100 border-green-600';
    }
    if (score <= 7) {
      return isDarkMode
        ? 'text-yellow-400 bg-yellow-900/30 border-yellow-600'
        : 'text-yellow-600 bg-yellow-100 border-yellow-600';
    }
    return isDarkMode
      ? 'text-red-400 bg-red-900/30 border-red-600'
      : 'text-red-600 bg-red-100 border-red-600';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 3) return 'Low Risk';
    if (score <= 7) return 'Medium Risk';
    return 'High Risk';
  };
  
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
      'valuation stretch': 'overpriced stock',
      'valuation risk': 'risk of price being too high',
      'multiple compression': 'price dropping',
      'mean reversion': 'return to normal price',
      'beta': 'volatility (how much the price swings)',
      'macro': 'economy-wide',
      'systematic risk': 'overall market risk',
      'liquidity risk': 'difficulty selling quickly',
      'downside risk': 'risk of losing money',
      'margin compression': 'profit shrinking',
      'headwind': 'challenge',
      'tailwind': 'advantage',
      'concentration risk': 'risk from being too focused',
    };
    
    for (const [term, replacement] of Object.entries(replacements)) {
      const regex = new RegExp(term, 'gi');
      simplified = simplified.replace(regex, replacement);
    }
    
    return simplified;
  };

  // Generate TLDR summary as bullet points
  const getTLDRBullets = () => {
    if (bullets.length === 0) return ["No risk data available."];
    
    // Take first 2-3 risk bullets
    return bullets.slice(0, Math.min(3, bullets.length)).map(bullet => {
      let text = bullet;
      
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
      {/* Card header with risk score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-2xl mr-2"></span>
          <h2 className={`text-2xl font-bold transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Risk Thesis
          </h2>
        </div>
        
        {/* Risk Score Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${getScoreColor(riskScore)}`}>
          <div className="text-xl font-bold">{riskScore}</div>
          <div className="text-sm font-semibold">{getRiskLabel(riskScore)}</div>
        </div>
      </div>

      {/* Subheader with TLDR button */}
      <div className="flex items-center justify-between mb-4">
        <p className={`text-sm transition-colors ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Key risks to consider before investing
        </p>
        {bullets.length > 0 && (
          <button
            onClick={() => setShowTLDR(!showTLDR)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              isDarkMode
                ? 'bg-orange-900/30 text-orange-400 hover:bg-orange-900/50'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
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
              ? 'bg-orange-900/20 border-orange-600'
              : 'bg-orange-50 border-orange-500'
          }`}>
            <p className={`font-bold text-base mb-3 transition-colors ${
              isDarkMode ? 'text-orange-400' : 'text-orange-700'
            }`}>TL;DR:</p>
            <ul className="space-y-2">
              {getTLDRBullets().map((bullet, index) => (
                <li key={index} className="flex items-start">
                  <span className={`font-bold mr-2 mt-0.5 transition-colors ${
                    isDarkMode ? 'text-orange-400' : 'text-orange-600'
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
          <ul className="space-y-3">
            {bullets.map((bullet, index) => (
              <li key={index} className="flex items-start">
                {/* Warning indicator */}
                <span className={`font-bold mr-3 mt-1 transition-colors ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                }`}>•</span>

                {/* Bullet text */}
                <span className={`leading-relaxed transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        )
      ) : (
        <p className={`italic transition-colors ${
          isDarkMode ? 'text-gray-500' : 'text-gray-500'
        }`}>
          No risk analysis available
        </p>
      )}
    </div>
  );
}
