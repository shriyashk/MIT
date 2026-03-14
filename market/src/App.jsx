import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import MarketOverview from './components/MarketOverview';
import WatchlistPanel from './components/WatchlistPanel';
import PriceChart from './components/PriceChart';
import NewsFeed from './components/NewsFeed';
import HeatMap from './components/HeatMap';
import { useWebSocket } from './hooks/useWebSocket';
import { api } from './utils/api';

export default function App() {
  const [watchlists, setWatchlists] = useState({});
  const [activeList, setActiveList] = useState('indices');
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [indices, setIndices] = useState([]);
  const [news, setNews] = useState([]);
  const [companyNews, setCompanyNews] = useState([]);
  const [error, setError] = useState(null);

  const { quotes, news: wsNews, connected, subscribe } = useWebSocket();

  // Load watchlists on mount
  useEffect(() => {
    api.watchlists().then(setWatchlists).catch(e => setError(e.message));
  }, []);

  // Load market summary
  useEffect(() => {
    api.marketSummary().then(setIndices).catch(() => {});
  }, []);

  // Load news
  useEffect(() => {
    api.news().then(setNews).catch(() => {});
  }, []);

  // Subscribe to active watchlist symbols via WebSocket
  useEffect(() => {
    const list = watchlists[activeList];
    if (list?.symbols) {
      subscribe(list.symbols);
    }
  }, [watchlists, activeList, subscribe, connected]);

  // Load company news when symbol selected
  useEffect(() => {
    if (!selectedSymbol) { setCompanyNews([]); return; }
    api.companyNews(selectedSymbol).then(setCompanyNews).catch(() => setCompanyNews([]));
  }, [selectedSymbol]);

  // Merge WebSocket news with initial news
  const allNews = wsNews.length > 0 ? wsNews : news;

  const handleSelectSymbol = useCallback((symbol) => {
    setSelectedSymbol(symbol);
    const list = watchlists[activeList];
    const syms = list?.symbols ? [...new Set([...list.symbols, symbol])] : [symbol];
    subscribe(syms);
  }, [watchlists, activeList, subscribe]);

  const handleSelectList = useCallback((key) => {
    setActiveList(key);
    setSelectedSymbol(null);
  }, []);

  if (error) {
    return (
      <div style={{ background: '#010409', minHeight: '100vh', fontFamily: "'IBM Plex Mono', monospace", color: '#c9d1d9', padding: 24 }}>
        <div style={{ background: '#161b22', border: '1px solid #f85149', borderRadius: 8, padding: 24, maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
          <div style={{ color: '#f85149', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Connection Error</div>
          <div style={{ color: '#8b949e', fontSize: 12, marginBottom: 16 }}>{error}</div>
          <div style={{ color: '#8b949e', fontSize: 11 }}>
            Make sure the backend server is running:<br />
            <code style={{ color: '#58a6ff', display: 'block', marginTop: 8 }}>npm run server</code>
          </div>
          <button onClick={() => { setError(null); window.location.reload(); }}
            style={{ marginTop: 16, background: '#1f6feb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#010409', minHeight: '100vh', fontFamily: "'IBM Plex Mono', 'Courier New', monospace", color: '#c9d1d9', padding: 24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0d1117; } ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 2px; }
        a:hover { text-decoration: underline !important; }
        button { font-family: inherit; }
      `}</style>

      <Header onSelectSymbol={handleSelectSymbol} connected={connected} />

      <MarketOverview indices={indices} />

      <HeatMap quotes={quotes} onSelectSymbol={handleSelectSymbol} />

      {/* Main layout: Chart + News center, Watchlist sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        <div>
          <PriceChart symbol={selectedSymbol} quote={quotes[selectedSymbol]} />
          <NewsFeed news={allNews} companyNews={companyNews} selectedSymbol={selectedSymbol} />
        </div>
        <WatchlistPanel
          watchlists={watchlists}
          activeList={activeList}
          onSelectList={handleSelectList}
          quotes={quotes}
          onSelectSymbol={handleSelectSymbol}
        />
      </div>

      {/* Footer */}
      <div style={{ marginTop: 20, padding: '12px 16px', background: '#161b22', border: '1px solid #1f6feb', borderRadius: 6, fontSize: 11, color: '#8b949e', lineHeight: 1.7 }}>
        <span style={{ color: '#58a6ff', fontWeight: 600 }}>MARKET INTELLIGENCE TERMINAL </span>
        Real-time data via Yahoo Finance · News via Finnhub · WebSocket live updates every 5s · All markets: NSE/BSE · NYSE/NASDAQ · LSE · TSE · HKEX · Commodities · Forex · Crypto
      </div>
    </div>
  );
}
