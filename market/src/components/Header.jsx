import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

export default function Header({ onSelectSymbol, connected }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await api.search(query);
        setResults(data);
        setShowResults(true);
      } catch (e) {
        setResults([]);
      }
    }, 300);
  }, [query]);

  return (
    <div style={{ marginBottom: 20, borderBottom: '1px solid #21262d', paddingBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: '#58a6ff', letterSpacing: '0.15em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            MARKET INTELLIGENCE TERMINAL
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#3fb950' : '#f85149', display: 'inline-block' }} />
            <span style={{ color: connected ? '#3fb950' : '#f85149', fontSize: 9 }}>{connected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#f0f6fc', fontFamily: "'IBM Plex Sans', sans-serif", letterSpacing: '-0.02em' }}>
            Real-Time Global Markets
          </h1>
          <div style={{ color: '#8b949e', fontSize: 11, marginTop: 4 }}>
            Stocks · Commodities · Forex · Crypto · Live Events
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: 320 }}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder="Search any stock, commodity, forex..."
            style={{
              width: '100%', padding: '10px 14px', background: '#0d1117', border: '1px solid #30363d',
              borderRadius: 8, color: '#f0f6fc', fontSize: 13, fontFamily: 'inherit', outline: 'none',
            }}
          />
          {showResults && results.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
              background: '#161b22', border: '1px solid #30363d', borderRadius: 8,
              maxHeight: 300, overflow: 'auto', zIndex: 100,
            }}>
              {results.map(r => (
                <div key={r.symbol}
                  style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #21262d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onMouseDown={() => { onSelectSymbol(r.symbol); setQuery(''); setShowResults(false); }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1c2128'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div style={{ color: '#58a6ff', fontSize: 13, fontWeight: 600 }}>{r.symbol}</div>
                    <div style={{ color: '#8b949e', fontSize: 11 }}>{r.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#8b949e', fontSize: 10 }}>{r.type}</div>
                    <div style={{ color: '#484f58', fontSize: 10 }}>{r.exchDisp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
