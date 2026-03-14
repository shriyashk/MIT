import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

/**
 * Search for symbols across all markets
 */
export async function searchSymbols(query) {
  try {
    const result = await yahooFinance.search(query, { newsCount: 0 });
    return (result.quotes || []).map(q => ({
      symbol: q.symbol,
      name: q.shortname || q.longname || q.symbol,
      type: q.quoteType,
      exchange: q.exchange,
      exchDisp: q.exchDisp,
    })).slice(0, 20);
  } catch (err) {
    console.error('Search error:', err.message);
    return [];
  }
}

/**
 * Get real-time quotes for multiple symbols
 */
export async function getQuotes(symbols) {
  const results = [];
  const promises = symbols.map(async (symbol) => {
    try {
      const quote = await yahooFinance.quote(symbol);
      return {
        symbol: quote.symbol,
        name: quote.shortName || quote.longName || quote.symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        previousClose: quote.regularMarketPreviousClose,
        open: quote.regularMarketOpen,
        dayHigh: quote.regularMarketDayHigh,
        dayLow: quote.regularMarketDayLow,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
        currency: quote.currency,
        exchange: quote.fullExchangeName,
        quoteType: quote.quoteType,
        marketState: quote.marketState,
        timestamp: Date.now(),
      };
    } catch (err) {
      console.error(`Quote error for ${symbol}:`, err.message);
      return { symbol, error: err.message };
    }
  });

  const settled = await Promise.allSettled(promises);
  for (const result of settled) {
    if (result.status === 'fulfilled' && result.value) {
      results.push(result.value);
    }
  }
  return results;
}

/**
 * Get historical price data for charting
 */
export async function getHistoricalData(symbol, range = '1mo', interval = '1d') {
  try {
    const periodMap = {
      '1d': { period1: daysAgo(1), interval: '5m' },
      '5d': { period1: daysAgo(5), interval: '15m' },
      '1mo': { period1: daysAgo(30), interval: '1d' },
      '3mo': { period1: daysAgo(90), interval: '1d' },
      '6mo': { period1: daysAgo(180), interval: '1wk' },
      '1y': { period1: daysAgo(365), interval: '1wk' },
      '5y': { period1: daysAgo(1825), interval: '1mo' },
    };

    const params = periodMap[range] || periodMap['1mo'];
    const result = await yahooFinance.chart(symbol, {
      period1: params.period1,
      interval: params.interval,
    });

    const quotes = result.quotes || [];
    return quotes.map(q => ({
      date: q.date,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume,
    })).filter(q => q.close != null);
  } catch (err) {
    console.error(`History error for ${symbol}:`, err.message);
    return [];
  }
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/**
 * Get market summary — major indices
 */
export async function getMarketSummary() {
  const indices = ['^NSEI', '^BSESN', '^GSPC', '^DJI', '^IXIC', '^FTSE', '^N225', '^HSI'];
  return getQuotes(indices);
}
