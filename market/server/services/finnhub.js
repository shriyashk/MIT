import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.FINNHUB_API_KEY || '';
const BASE_URL = 'https://finnhub.io/api/v1';

async function fetchFinnhub(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('token', API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Finnhub API error: ${res.status}`);
  return res.json();
}

/**
 * Get general market news
 * Categories: general, forex, crypto, merger
 */
export async function getMarketNews(category = 'general') {
  try {
    if (!API_KEY || API_KEY === 'your_finnhub_api_key_here') {
      return getMockNews();
    }
    const data = await fetchFinnhub('/news', { category });
    return data.slice(0, 30).map(formatNewsItem);
  } catch (err) {
    console.error('Market news error:', err.message);
    return getMockNews();
  }
}

/**
 * Get company-specific news
 */
export async function getCompanyNews(symbol) {
  try {
    if (!API_KEY || API_KEY === 'your_finnhub_api_key_here') {
      return getMockNews(symbol);
    }
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const data = await fetchFinnhub('/company-news', { symbol, from, to });
    return data.slice(0, 20).map(formatNewsItem);
  } catch (err) {
    console.error(`Company news error for ${symbol}:`, err.message);
    return getMockNews(symbol);
  }
}

function formatNewsItem(item) {
  return {
    id: item.id,
    headline: item.headline,
    summary: item.summary,
    source: item.source,
    url: item.url,
    image: item.image,
    datetime: item.datetime * 1000,
    category: item.category,
    related: item.related,
    sentiment: analyzeSentiment(item.headline + ' ' + (item.summary || '')),
  };
}

/**
 * Basic keyword-based sentiment analysis
 */
function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  const positive = ['surge', 'rally', 'gain', 'rise', 'jump', 'soar', 'upgrade', 'bull', 'record high', 'growth', 'profit', 'beat', 'outperform', 'recovery', 'boost', 'breakout'];
  const negative = ['crash', 'plunge', 'drop', 'fall', 'decline', 'slump', 'downgrade', 'bear', 'loss', 'miss', 'cut', 'crisis', 'war', 'sanctions', 'default', 'layoff', 'recession', 'selloff'];

  let score = 0;
  for (const word of positive) {
    if (lower.includes(word)) score += 1;
  }
  for (const word of negative) {
    if (lower.includes(word)) score -= 1;
  }

  if (score > 0) return { label: 'positive', score, color: '#3fb950' };
  if (score < 0) return { label: 'negative', score, color: '#f85149' };
  return { label: 'neutral', score: 0, color: '#58a6ff' };
}

/**
 * Mock news for when no API key is set
 */
function getMockNews(symbol) {
  const now = Date.now();
  const prefix = symbol ? `${symbol}: ` : '';
  return [
    {
      id: 1, headline: `${prefix}Global Markets React to Central Bank Policy Shifts`,
      summary: 'Major indices show mixed performance as investors digest latest monetary policy signals from Fed, ECB, and RBI.',
      source: 'Reuters', url: '#', image: '', datetime: now - 300000,
      category: 'general', related: symbol || '',
      sentiment: { label: 'neutral', score: 0, color: '#58a6ff' }
    },
    {
      id: 2, headline: `${prefix}Crude Oil Prices Surge Amid Middle East Tensions`,
      summary: 'Brent crude crosses $95/barrel as geopolitical risks escalate. Energy stocks rally across Asian and European markets.',
      source: 'Bloomberg', url: '#', image: '', datetime: now - 600000,
      category: 'general', related: symbol || '',
      sentiment: { label: 'negative', score: -1, color: '#f85149' }
    },
    {
      id: 3, headline: `${prefix}Tech Stocks Lead Recovery as AI Spending Accelerates`,
      summary: 'NASDAQ jumps 2.3% as major tech firms report stronger-than-expected cloud and AI infrastructure demand.',
      source: 'CNBC', url: '#', image: '', datetime: now - 900000,
      category: 'general', related: symbol || '',
      sentiment: { label: 'positive', score: 2, color: '#3fb950' }
    },
    {
      id: 4, headline: `${prefix}Gold Hits All-Time High on Safe Haven Demand`,
      summary: 'Gold futures breach $2,800/oz for the first time, driven by geopolitical uncertainty and central bank buying.',
      source: 'Financial Times', url: '#', image: '', datetime: now - 1200000,
      category: 'general', related: symbol || '',
      sentiment: { label: 'positive', score: 1, color: '#3fb950' }
    },
    {
      id: 5, headline: `${prefix}Indian Rupee Under Pressure as FII Outflows Continue`,
      summary: 'INR slips to 84.5/$1 as foreign institutional investors pull $2.3B from Indian equities this month.',
      source: 'Economic Times', url: '#', image: '', datetime: now - 1800000,
      category: 'general', related: symbol || '',
      sentiment: { label: 'negative', score: -2, color: '#f85149' }
    },
    {
      id: 6, headline: `${prefix}RBI Holds Rates Steady, Signals Data-Dependent Approach`,
      summary: 'Reserve Bank of India maintains repo rate at 6.5%, citing balanced risks to growth and inflation outlook.',
      source: 'Mint', url: '#', image: '', datetime: now - 3600000,
      category: 'general', related: symbol || '',
      sentiment: { label: 'neutral', score: 0, color: '#58a6ff' }
    },
  ];
}
