
import type { Currency } from './types';

// Using a simple, no-auth API for demonstration purposes.
const API_BASE = 'https://open.er-api.com/v6/latest/';

// In-memory cache to avoid repeated API calls for the same data within a short period.
// The key is the 'from' currency (e.g., 'USD'), and the value is the fetched data.
const currencyCache = new Map<Currency, { data: any; timestamp: number }>();
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Fetches the latest exchange rate from a base currency.
 * @param from The base currency (e.g., 'USD').
 * @param to The target currency (e.g., 'GBP').
 * @returns The exchange rate.
 */
export async function getExchangeRate(from: Currency, to: Currency): Promise<number> {
  const now = Date.now();
  const cached = currencyCache.get(from);

  if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
    return cached.data.rates[to];
  }

  try {
    const response = await fetch(`${API_BASE}${from}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }
    const data = await response.json();
    
    if (data.result === 'error') {
        throw new Error(`API Error: ${data['error-type']}`);
    }

    currencyCache.set(from, { data, timestamp: now });

    const rate = data.rates[to];
    if (!rate) {
      throw new Error(`Rate for currency "${to}" not found in API response.`);
    }

    return rate;
  } catch (error) {
    console.error("Currency service error:", error);
    // As a fallback, if the API fails, return a static rate to avoid breaking the app.
    // This makes the feature resilient.
    if (from === 'USD' && to === 'GBP') {
      return 0.8;
    }
    // For other pairs, you might want a different fallback or to re-throw the error.
    throw error;
  }
}
