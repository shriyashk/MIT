import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket(url = 'ws://localhost:3001') {
  const wsRef = useRef(null);
  const [quotes, setQuotes] = useState({});
  const [news, setNews] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      // Auto-reconnect after 3s
      setTimeout(() => {
        wsRef.current = new WebSocket(url);
      }, 3000);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'quotes') {
          setQuotes(prev => {
            const next = { ...prev };
            for (const q of msg.data) {
              if (!q.error) next[q.symbol] = q;
            }
            return next;
          });
        }
        if (msg.type === 'news') {
          setNews(msg.data);
        }
      } catch (e) {
        // ignore
      }
    };

    return () => ws.close();
  }, [url]);

  const subscribe = useCallback((symbols) => {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', symbols }));
    }
  }, []);

  return { quotes, news, connected, subscribe };
}
