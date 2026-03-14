import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../utils/api';

const RANGES = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '5y'];

export default function PriceChart({ symbol, quote }) {
  const [range, setRange] = useState('1mo');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    api.history(symbol, range).then(d => {
      if (!cancelled) { setData(d); setLoading(false); }
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [symbol, range]);

  if (!symbol) {
    return (
      <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: 40, textAlign: 'center' }}>
        <div style={{ color: '#484f58', fontSize: 14 }}>Select a stock or search to view chart</div>
      </div>
    );
  }

  const isPos = (quote?.changePercent || 0) >= 0;
  const lineColor = isPos ? '#3fb950' : '#f85149';

  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-IN', {
      month: 'short', day: 'numeric',
      ...(range === '1d' || range === '5d' ? { hour: '2-digit', minute: '2-digit' } : {}),
    }),
    close: d.close,
    volume: d.volume,
  }));

  return (
    <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: 20, marginBottom: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ color: '#58a6ff', fontSize: 16, fontWeight: 600 }}>{symbol}</span>
            <span style={{ color: '#8b949e', fontSize: 12 }}>{quote?.name}</span>
          </div>
          {quote && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
              <span style={{ color: '#f0f6fc', fontSize: 28, fontWeight: 600 }}>
                {quote.currency === 'INR' ? '₹' : quote.currency === 'USD' ? '$' : ''}{quote.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <span style={{ color: isPos ? '#3fb950' : '#f85149', fontSize: 14 }}>
                {isPos ? '▲' : '▼'} {quote.change?.toFixed(2)} ({Math.abs(quote.changePercent || 0).toFixed(2)}%)
              </span>
            </div>
          )}
          {quote && (
            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10, color: '#8b949e' }}>
              <span>Open: {quote.open?.toLocaleString()}</span>
              <span>High: {quote.dayHigh?.toLocaleString()}</span>
              <span>Low: {quote.dayLow?.toLocaleString()}</span>
              <span>Vol: {(quote.volume / 1e6)?.toFixed(2)}M</span>
              {quote.marketCap && <span>MCap: {(quote.marketCap / 1e9)?.toFixed(1)}B</span>}
              <span>52W: {quote.fiftyTwoWeekLow?.toLocaleString()} – {quote.fiftyTwoWeekHigh?.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Range selector */}
        <div style={{ display: 'flex', gap: 4 }}>
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{
                background: range === r ? '#1f6feb' : '#161b22',
                color: range === r ? '#fff' : '#8b949e',
                border: `1px solid ${range === r ? '#1f6feb' : '#30363d'}`,
                borderRadius: 4, padding: '4px 8px', fontSize: 10,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58' }}>
          Loading chart data...
        </div>
      ) : chartData.length === 0 ? (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58' }}>
          No data available for this range
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.15} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#161b22" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#8b949e', fontSize: 10 }}
              axisLine={{ stroke: '#21262d' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#8b949e', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={60}
              domain={['auto', 'auto']}
              tickFormatter={v => v.toLocaleString()}
            />
            <Tooltip
              contentStyle={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#8b949e' }}
              formatter={(value) => [value?.toLocaleString(undefined, { maximumFractionDigits: 2 }), 'Price']}
            />
            <Area type="monotone" dataKey="close" stroke={lineColor} strokeWidth={2} fill="url(#colorFill)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Exchange info */}
      {quote && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: '#484f58' }}>
          <span>{quote.exchange} · {quote.quoteType}</span>
          <span>{quote.marketState === 'REGULAR' ? '● Market Open' : '○ Market Closed'}</span>
        </div>
      )}
    </div>
  );
}
