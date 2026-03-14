import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import http from 'http';
import { getQuotes, searchSymbols, getHistoricalData, getMarketSummary } from './services/yahoo.js';
import { getMarketNews, getCompanyNews } from './services/finnhub.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── REST API Routes ───────────────────────────────────────────

// Search symbols across all markets
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const results = await searchSymbols(q);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get real-time quotes for multiple symbols
app.get('/api/quotes', async (req, res) => {
  try {
    const symbols = req.query.symbols?.split(',') || [];
    if (!symbols.length) return res.json([]);
    const quotes = await getQuotes(symbols);
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get historical data for charting
app.get('/api/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { range = '1mo', interval = '1d' } = req.query;
    const data = await getHistoricalData(symbol, range, interval);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Market summary — indices, trending
app.get('/api/market-summary', async (req, res) => {
  try {
    const summary = await getMarketSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Market news
app.get('/api/news', async (req, res) => {
  try {
    const { category = 'general' } = req.query;
    const news = await getMarketNews(category);
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Company-specific news
app.get('/api/news/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const news = await getCompanyNews(symbol);
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Predefined watchlists
app.get('/api/watchlists', (req, res) => {
  res.json({
    indices: {
      label: 'Global Indices',
      symbols: ['^NSEI', '^BSESN', '^GSPC', '^DJI', '^IXIC', '^FTSE', '^N225', '^HSI', '^GDAXI']
    },
    indianStocks: {
      label: 'Indian Blue Chips',
      symbols: ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ITC.NS', 'HINDUNILVR.NS', 'BHARTIARTL.NS', 'SBIN.NS', 'BAJFINANCE.NS', 'MARUTI.NS', 'LT.NS', 'TATAMOTORS.NS', 'WIPRO.NS', 'ADANIENT.NS', 'ONGC.NS']
    },
    usStocks: {
      label: 'US Tech Giants',
      symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD', 'NFLX', 'CRM']
    },
    commodities: {
      label: 'Commodities',
      symbols: ['GC=F', 'SI=F', 'CL=F', 'NG=F', 'HG=F', 'PL=F', 'ZW=F', 'ZC=F', 'KC=F', 'CT=F']
    },
    forex: {
      label: 'Forex',
      symbols: ['USDINR=X', 'EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'AUDUSD=X', 'USDCAD=X', 'EURGBP=X', 'USDCHF=X']
    },
    crypto: {
      label: 'Crypto',
      symbols: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD', 'ADA-USD', 'DOGE-USD', 'DOT-USD']
    },
    cgd: {
      label: 'CGD Stocks (India)',
      symbols: ['IGL.NS', 'MGL.NS', 'GUJGASLTD.NS', 'ATGL.NS', 'GSPL.NS']
    }
  });
});

// ─── HTTP + WebSocket Server ───────────────────────────────────

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Track active subscriptions per client
const clients = new Map();

wss.on('connection', (ws) => {
  const clientId = Math.random().toString(36).slice(2);
  clients.set(clientId, { ws, symbols: [], interval: null });

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === 'subscribe') {
        const client = clients.get(clientId);
        client.symbols = data.symbols || [];

        // Clear existing interval
        if (client.interval) clearInterval(client.interval);

        // Push quotes every 5 seconds
        const pushQuotes = async () => {
          if (client.symbols.length === 0 || ws.readyState !== 1) return;
          try {
            const quotes = await getQuotes(client.symbols);
            ws.send(JSON.stringify({ type: 'quotes', data: quotes }));
          } catch (e) {
            // Silently continue on transient errors
          }
        };

        pushQuotes(); // immediate first push
        client.interval = setInterval(pushQuotes, 5000);
      }

      if (data.type === 'unsubscribe') {
        const client = clients.get(clientId);
        client.symbols = [];
        if (client.interval) clearInterval(client.interval);
      }
    } catch (e) {
      // ignore malformed messages
    }
  });

  ws.on('close', () => {
    const client = clients.get(clientId);
    if (client?.interval) clearInterval(client.interval);
    clients.delete(clientId);
  });
});

// Global news broadcast every 60 seconds
setInterval(async () => {
  try {
    const news = await getMarketNews('general');
    const payload = JSON.stringify({ type: 'news', data: news.slice(0, 10) });
    wss.clients.forEach((ws) => {
      if (ws.readyState === 1) ws.send(payload);
    });
  } catch (e) {
    // continue
  }
}, 60000);

server.listen(PORT, () => {
  console.log(`Market Intelligence Server running on port ${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}`);
});
