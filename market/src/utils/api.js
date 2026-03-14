const API_BASE = '/api';

export async function fetchJSON(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  search: (q) => fetchJSON(`/search?q=${encodeURIComponent(q)}`),
  quotes: (symbols) => fetchJSON(`/quotes?symbols=${symbols.join(',')}`),
  history: (symbol, range = '1mo') => fetchJSON(`/history/${symbol}?range=${range}`),
  marketSummary: () => fetchJSON('/market-summary'),
  news: (category = 'general') => fetchJSON(`/news?category=${category}`),
  companyNews: (symbol) => fetchJSON(`/news/${symbol}`),
  watchlists: () => fetchJSON('/watchlists'),
};
