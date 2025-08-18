
import type { Currency } from './types';

// Using a service that requires an API key.
const API_BASE = 'https://api.freecurrencyapi.com/v1/latest';
const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;

// In-memory cache to avoid repeated API calls.
const currencyCache = new Map<Currency, { data: any; timestamp: number }>();
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Fetches the latest exchange rate from a base currency.
 * @param from The base currency (e.g., 'USD').
 * @param to The target currency (e.g., 'GBP').
 * @returns The exchange rate.
 */
export async function getExchangeRate(from: Currency, to: Currency): Promise<number> {
  if (!API_KEY) {
    console.warn('API key for currency conversion is missing. Using fallback rate.');
    // Fallback to a static rate if the API key is not provided.
    const fallbackRates: { [key: string]: number } = {
      'USD_GBP': 0.8,
      'AUD_GBP': 0.55,
    };
    const rateKey = `${from}_${to}`;
    if (fallbackRates[rateKey]) {
      return fallbackRates[rateKey];
    }
    throw new Error('API key is not configured and no fallback exists for this currency pair.');
  }

  const now = Date.now();
  const cached = currencyCache.get(from);

  if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
    return cached.data.data[to];
  }

  try {
    const response = await fetch(`${API_BASE}?apikey=${API_KEY}&base_currency=${from}&currencies=${to}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }
    const data = await response.json();
    
    if (data.errors) {
        throw new Error(`API Error: ${JSON.stringify(data.errors)}`);
    }

    currencyCache.set(from, { data, timestamp: now });

    const rate = data.data[to];
    if (!rate) {
      throw new Error(`Rate for currency "${to}" not found in API response.`);
    }

    return rate;
  } catch (error) {
    console.error("Currency service error:", error);
    // As a fallback, if the API fails, return a static rate to avoid breaking the app.
    const fallbackRates: { [key: string]: number } = {
        'USD_GBP': 0.8,
        'AUD_GBP': 0.55,
    };
    const rateKey = `${from}_${to}`;
    if (fallbackRates[rateKey]) {
      return fallbackRates[rateKey];
    }
    throw error;
  }
}
