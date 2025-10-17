import type { AnalysisResponse } from './types';

const API_BASE_URL = 'http://localhost:8080';

export async function analyzeTicker(
  ticker: string,
  days: number = 7
): Promise<AnalysisResponse> {
  try {
    const url = `${API_BASE_URL}/analyze?ticker=${encodeURIComponent(ticker)}&days=${days}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data: AnalysisResponse = await response.json();
    return data;

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unknown error occurred while fetching analysis');
    }
  }
}
