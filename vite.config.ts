import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

// Server-side gold price fetcher plugin with cache
function liveGoldPricePlugin(): Plugin {
  let cachedPriceData: { price: number; source: string; timestamp: number } | null = null;
  const CACHE_TTL_MS = 6000; // 6 seconds cache to prevent rate-limits

  return {
    name: 'live-gold-price-api',
    configureServer(server) {
      server.middlewares.use('/api/live-gold', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        const now = Date.now();
        const urlObj = new URL(req.url || '', 'http://localhost:3000');
        const apiKey = urlObj.searchParams.get('apikey') || '';

        // If we have fresh cached data and no custom API key requested, return cached
        if (!apiKey && cachedPriceData && now - cachedPriceData.timestamp < CACHE_TTL_MS) {
          res.end(JSON.stringify({ success: true, ...cachedPriceData }));
          return;
        }

        let price: number | null = null;
        let sourceUsed = '';

        // 1. TwelveData if key exists
        if (apiKey) {
          try {
            const tdRes = await fetch(`https://api.twelvedata.com/price?symbol=XAU/USD&apikey=${apiKey}`, {
              headers: { 'User-Agent': 'Mozilla/5.0 AREWA-CRITICS-Bot' }
            });
            const tdData = await tdRes.json();
            if (tdData && tdData.price && !isNaN(parseFloat(tdData.price))) {
              price = parseFloat(tdData.price);
              sourceUsed = 'TwelveData';
            }
          } catch (e) {
            console.warn('[Gold API] TwelveData failed:', (e as Error).message);
          }
        }

        // 2. GoldPrice.org (bid)
        if (!price) {
          try {
            const gpRes = await fetch('https://data-asg.goldprice.org/dbXRates/USD', {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://goldprice.org/'
              }
            });
            if (gpRes.ok) {
              const gpData = await gpRes.json();
              const xauBid = gpData?.items?.[0]?.xauPrice || gpData?.xauPrice;
              if (xauBid && !isNaN(parseFloat(xauBid))) {
                price = parseFloat(xauBid);
                sourceUsed = 'GoldPrice.org';
              }
            }
          } catch (e) {
            // GoldPrice.org may fail or be 403
          }
        }

        // 3. Metals.live
        if (!price) {
          try {
            const mlRes = await fetch('https://api.metals.live/v1/spot', {
              headers: { 'User-Agent': 'Mozilla/5.0 AREWA-CRITICS-Bot' }
            });
            if (mlRes.ok) {
              const mlData = await mlRes.json();
              const goldSpot = mlData?.gold || mlData?.[0]?.gold;
              if (goldSpot && !isNaN(parseFloat(goldSpot))) {
                price = parseFloat(goldSpot);
                sourceUsed = 'Metals.live';
              }
            }
          } catch (e) {
            // continue
          }
        }

        // 4. Institutional Real-time Spot Gold Feed (PAXG 1:1 LBMA Physical Gold backed spot)
        if (!price) {
          try {
            const binanceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT');
            if (binanceRes.ok) {
              const bData = await binanceRes.json();
              if (bData && bData.price && !isNaN(parseFloat(bData.price))) {
                price = parseFloat(bData.price);
                sourceUsed = 'Binance Gold Feed';
              }
            }
          } catch (e) {
            // continue
          }
        }

        // 5. Kraken PAXG/USD Spot
        if (!price) {
          try {
            const krakenRes = await fetch('https://api.kraken.com/0/public/Ticker?pair=PAXGUSD');
            if (krakenRes.ok) {
              const kData = await krakenRes.json();
              const lastTrade = kData?.result?.PAXGUSD?.c?.[0];
              if (lastTrade && !isNaN(parseFloat(lastTrade))) {
                price = parseFloat(lastTrade);
                sourceUsed = 'Kraken Gold Feed';
              }
            }
          } catch (e) {
            // continue
          }
        }

        if (price !== null && !isNaN(price) && price > 0) {
          const payload = {
            price: Number(price.toFixed(2)),
            source: sourceUsed,
            timestamp: now
          };
          if (!apiKey) {
            cachedPriceData = payload;
          }
          res.end(JSON.stringify({ success: true, ...payload }));
        } else {
          res.statusCode = 503;
          res.end(JSON.stringify({
            success: false,
            error: 'LIVE PRICE OFFLINE - CHECK INTERNET / API KEY',
            timestamp: now
          }));
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), liveGoldPricePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
