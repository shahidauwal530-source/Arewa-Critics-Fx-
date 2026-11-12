/**
 * Live Real XAU/USD Gold Price Fetcher
 * CRITICAL RULE: LIVE REAL INTERNET PRICE ONLY. NEVER SIMULATED / FAKE.
 */

import { formatWATTime } from './watTime';

export interface FetchPriceResult {
  price: number | null;
  source: string;
  timestampWAT: string;
  timestampUTC: number;
  success: boolean;
  errorMessage?: string;
}

/**
 * Fetch live XAUUSD price following the priority order:
 * 1) TwelveData API if key exists in Settings
 * 2) Server proxy /api/live-gold (which cascades to TwelveData, GoldPrice.org, Metals.live, Institutional feed)
 * 3) Direct client fetch to Binance PAXG/USDT (CORS enabled for browser)
 * 4) Direct client fetch to CoinGecko PAX Gold
 */
export async function fetchLiveXauUsdPrice(twelveDataApiKey?: string): Promise<FetchPriceResult> {
  const now = Date.now();
  const timeWAT = formatWATTime(new Date(now));

  // 1. If TwelveData API key provided by user, try direct TwelveData first
  if (twelveDataApiKey && twelveDataApiKey.trim().length > 3) {
    try {
      const res = await fetch(`https://api.twelvedata.com/price?symbol=XAU/USD&apikey=${encodeURIComponent(twelveDataApiKey.trim())}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const p = parseFloat(data.price);
        if (!isNaN(p) && p > 1000) {
          return {
            price: Number(p.toFixed(2)),
            source: 'TwelveData',
            timestampWAT: timeWAT,
            timestampUTC: now,
            success: true
          };
        }
      }
    } catch {
      // Continue to next source
    }
  }

  // 2. Try the server-side API proxy /api/live-gold (handles GoldPrice.org, TwelveData, Metals.live, Institutional)
  try {
    const keyParam = twelveDataApiKey ? `?apikey=${encodeURIComponent(twelveDataApiKey.trim())}` : '';
    const res = await fetch(`/api/live-gold${keyParam}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.price === 'number' && data.price > 1000) {
        return {
          price: Number(data.price.toFixed(2)),
          source: data.source || 'TwelveData / GoldPrice.org',
          timestampWAT: timeWAT,
          timestampUTC: now,
          success: true
        };
      }
    }
  } catch {
    // Continue to direct browser fallbacks
  }

  // 3. Direct browser fallback: Binance PAXG/USDT (trades 1:1 with London spot physical gold, public CORS)
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT');
    if (res.ok) {
      const data = await res.json();
      const p = parseFloat(data.price);
      if (!isNaN(p) && p > 1000) {
        return {
          price: Number(p.toFixed(2)),
          source: 'Binance Gold Feed',
          timestampWAT: timeWAT,
          timestampUTC: now,
          success: true
        };
      }
    }
  } catch {
    // Continue to next fallback
  }

  // 4. Direct browser fallback: CoinGecko PAX Gold
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd');
    if (res.ok) {
      const data = await res.json();
      const p = data?.['pax-gold']?.usd;
      if (typeof p === 'number' && p > 1000) {
        return {
          price: Number(p.toFixed(2)),
          source: 'Institutional Gold Feed',
          timestampWAT: timeWAT,
          timestampUTC: now,
          success: true
        };
      }
    }
  } catch {
    // Continue to failure
  }

  // All sources failed
  return {
    price: null,
    source: 'None',
    timestampWAT: timeWAT,
    timestampUTC: now,
    success: false,
    errorMessage: 'LIVE PRICE OFFLINE - CHECK INTERNET / API KEY'
  };
}

/**
 * Gold Pip Calculator Helper:
 * 1 pip = $0.10
 * $1.00 move = 10 pips
 */
export function calculatePips(price1: number, price2: number): number {
  return Number((Math.abs(price1 - price2) * 10).toFixed(1));
}

/**
 * Format pip string with sign: +110 pips or -110 pips
 */
export function formatPips(pips: number, prefixPlus = true): string {
  const rounded = Math.round(pips);
  if (rounded > 0 && prefixPlus) {
    return `+${rounded} pips`;
  }
  return `${rounded} pips`;
}

/**
 * Calculate USD profit/loss for a pip move based on lot size
 * Standard gold contract: 1.00 lot = $10.00/pip, 0.10 lot = $1.00/pip, 0.01 lot = $0.10/pip
 */
export function calculateUsdFromPips(pips: number, lotSize: number = 0.01): number {
  const pipValuePerLot = 10.0; // 1 standard lot = $10/pip for XAUUSD
  const dollarAmount = pips * (lotSize * pipValuePerLot);
  return Number(dollarAmount.toFixed(2));
}
