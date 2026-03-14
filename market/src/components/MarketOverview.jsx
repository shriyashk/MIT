export default function MarketOverview({ indices }) {
  if (!indices.length) return null;

  return (
    <div style={{ marginBottom: 20, overflow: 'hidden' }}>
      <div style={{ fontSize: 10, color: '#8b949e', marginBottom: 8, letterSpacing: '0.1em' }}>GLOBAL INDICES</div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {indices.map(idx => {
          if (idx.error) return null;
          const isPos = (idx.changePercent || 0) >= 0;
          return (
            <div key={idx.symbol} style={{
              background: '#0d1117', border: '1px solid #21262d', borderRadius: 6,
              padding: '10px 14px', minWidth: 140, flexShrink: 0,
            }}>
              <div style={{ color: '#8b949e', fontSize: 10, marginBottom: 4 }}>{idx.name || idx.symbol}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ color: '#f0f6fc', fontSize: 14, fontWeight: 600 }}>
                  {idx.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span style={{ color: isPos ? '#3fb950' : '#f85149', fontSize: 11 }}>
                  {isPos ? '▲' : '▼'} {Math.abs(idx.changePercent || 0).toFixed(2)}%
                </span>
              </div>
              <div style={{ fontSize: 9, color: '#484f58', marginTop: 4 }}>
                {idx.marketState === 'REGULAR' ? '● OPEN' : '○ CLOSED'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
