export default function NewsFeed({ news, companyNews, selectedSymbol }) {
  const displayNews = selectedSymbol && companyNews.length ? companyNews : news;
  const title = selectedSymbol && companyNews.length ? `NEWS · ${selectedSymbol}` : 'LIVE MARKET NEWS';

  return (
    <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: 16 }}>
      <div style={{ fontSize: 10, color: '#8b949e', marginBottom: 12, letterSpacing: '0.1em' }}>{title}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 500, overflow: 'auto' }}>
        {displayNews.length === 0 && (
          <div style={{ color: '#484f58', fontSize: 12, padding: 20, textAlign: 'center' }}>
            Loading news feed...
          </div>
        )}
        {displayNews.map((item, i) => {
          const sentimentColor = item.sentiment?.color || '#58a6ff';
          const timeAgo = getTimeAgo(item.datetime);

          return (
            <div key={item.id || i}
              style={{
                padding: '10px 12px', borderRadius: 6,
                borderLeft: `3px solid ${sentimentColor}`,
                borderBottom: '1px solid #161b22',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#161b22'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#f0f6fc', fontSize: 12, fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>
                    {item.url && item.url !== '#' ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#f0f6fc', textDecoration: 'none' }}>
                        {item.headline}
                      </a>
                    ) : item.headline}
                  </div>
                  {item.summary && (
                    <div style={{ color: '#8b949e', fontSize: 11, lineHeight: 1.5, maxHeight: 40, overflow: 'hidden' }}>
                      {item.summary}
                    </div>
                  )}
                </div>
                <div style={{
                  background: sentimentColor + '20', color: sentimentColor,
                  fontSize: 9, padding: '2px 6px', borderRadius: 3, whiteSpace: 'nowrap',
                  fontWeight: 600, textTransform: 'uppercase',
                }}>
                  {item.sentiment?.label || 'neutral'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 10, color: '#484f58' }}>
                <span>{item.source}</span>
                <span>{timeAgo}</span>
                {item.related && <span style={{ color: '#58a6ff' }}>{item.related}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getTimeAgo(timestamp) {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
