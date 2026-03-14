export default function HeatMap({ quotes, onSelectSymbol }) {
  const items = Object.values(quotes).filter(q => !q.error && q.price);

  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => Math.abs(b.changePercent || 0) - Math.abs(a.changePercent || 0));

  return (
    <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: 16, marginBottom: 20 }}>
      <div style={{ fontSize: 10, color: '#8b949e', marginBottom: 12, letterSpacing: '0.1em' }}>
        MARKET HEATMAP · Size by volume, color by change %
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {sorted.slice(0, 30).map(q => {
          const pct = q.changePercent || 0;
          const intensity = Math.min(Math.abs(pct) / 5, 1);
          const bg = pct >= 0
            ? `rgba(63, 185, 80, ${0.1 + intensity * 0.5})`
            : `rgba(248, 81, 73, ${0.1 + intensity * 0.5})`;
          const textColor = pct >= 0 ? '#3fb950' : '#f85149';

          const minW = 80;
          const maxW = 140;
          const w = minW + (maxW - minW) * (1 - sorted.indexOf(q) / sorted.length);

          return (
            <div key={q.symbol}
              onClick={() => onSelectSymbol(q.symbol)}
              style={{
                background: bg, borderRadius: 4, padding: '8px 10px',
                width: w, cursor: 'pointer', transition: 'transform 0.15s',
                border: '1px solid transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = '#30363d'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <div style={{ color: '#f0f6fc', fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {q.symbol?.replace('.NS', '').replace('=X', '').replace('=F', '').replace('-USD', '')}
              </div>
              <div style={{ color: textColor, fontSize: 12, fontWeight: 600, marginTop: 2 }}>
                {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
              </div>
              <div style={{ color: '#8b949e', fontSize: 9, marginTop: 2 }}>
                {q.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
