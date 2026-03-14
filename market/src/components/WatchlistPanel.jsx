export default function WatchlistPanel({ watchlists, activeList, onSelectList, quotes, onSelectSymbol }) {
  const lists = Object.entries(watchlists);

  return (
    <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: 16 }}>
      <div style={{ fontSize: 10, color: '#8b949e', marginBottom: 12, letterSpacing: '0.1em' }}>WATCHLISTS</div>

      {/* Watchlist tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {lists.map(([key, list]) => (
          <button key={key} onClick={() => onSelectList(key)}
            style={{
              background: activeList === key ? '#1f6feb' : '#161b22',
              color: activeList === key ? '#fff' : '#8b949e',
              border: `1px solid ${activeList === key ? '#1f6feb' : '#30363d'}`,
              borderRadius: 4, padding: '4px 10px', fontSize: 10, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}>
            {list.label}
          </button>
        ))}
      </div>

      {/* Quote cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 480, overflow: 'auto' }}>
        {watchlists[activeList]?.symbols.map(sym => {
          const q = quotes[sym];
          if (!q || q.error) {
            return (
              <div key={sym} onClick={() => onSelectSymbol(sym)}
                style={{ padding: '8px 12px', borderRadius: 4, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #161b22' }}>
                <span style={{ color: '#8b949e', fontSize: 12 }}>{sym}</span>
                <span style={{ color: '#484f58', fontSize: 10 }}>Loading...</span>
              </div>
            );
          }
          const isPos = (q.changePercent || 0) >= 0;
          return (
            <div key={sym} onClick={() => onSelectSymbol(sym)}
              style={{
                padding: '8px 12px', borderRadius: 4, cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid #161b22', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#161b22'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <div style={{ color: '#f0f6fc', fontSize: 12, fontWeight: 500 }}>{q.symbol}</div>
                <div style={{ color: '#484f58', fontSize: 10, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#f0f6fc', fontSize: 12, fontWeight: 600 }}>
                  {q.currency === 'INR' ? '₹' : q.currency === 'USD' ? '$' : ''}{q.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div style={{ color: isPos ? '#3fb950' : '#f85149', fontSize: 10 }}>
                  {isPos ? '▲' : '▼'} {Math.abs(q.changePercent || 0).toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
