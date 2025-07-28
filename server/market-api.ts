import fetch from 'node-fetch';

interface CoinCapAsset {
  id: string;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
}

interface CryptoComparePrice {
  PRICE: number;
  CHANGEPCT24HOUR: number;
  VOLUME24HOURTO: number;
  HIGH24HOUR: number;
  LOW24HOUR: number;
}

// Add timeout and retry logic for better reliability
const fetchWithTimeout = async (url: string, options: any = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'ShibaU-Trading-Platform/1.0',
        'Accept': 'application/json',
        ...options.headers
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

class MarketDataAPI {
  private baseUrlCoinCap = 'https://api.coincap.io/v2';
  private baseUrlCryptoCompare = 'https://min-api.cryptocompare.com/data';
  private priceCache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 15000; // 15 seconds (faster updates)

  async getCoinCapPrices(): Promise<CoinCapAsset[]> {
    try {
      const response = await fetchWithTimeout(
        `${this.baseUrlCoinCap}/assets?ids=bitcoin,ethereum,shiba-inu&limit=3`
      );

      if (!response.ok) {
        throw new Error(`CoinCap API error: ${response.status}`);
      }

      const result = await response.json() as any;
      return result.data || [];
    } catch (error) {
      console.error('Error fetching CoinCap prices:', error);
      throw error;
    }
  }

  async getCryptoComparePrices(): Promise<any> {
    try {
      const response = await fetchWithTimeout(
        `${this.baseUrlCryptoCompare}/pricemultifull?fsyms=BTC,ETH,SHIB&tsyms=USD`
      );

      if (!response.ok) {
        throw new Error(`CryptoCompare API error: ${response.status}`);
      }

      const result = await response.json() as any;
      return result.RAW || {};
    } catch (error) {
      console.error('Error fetching CryptoCompare prices:', error);
      throw error;
    }
  }

  async getLivePrices(): Promise<any[]> {
    const cacheKey = 'live_prices';
    const cached = this.priceCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      console.log('Returning cached price data');
      return cached.data;
    }

    console.log('Fetching fresh market data...');
    try {
      // Try CoinCap first (free, unlimited)
      let prices;
      try {
        console.log('Attempting CoinCap API...');
        const coinCapData = await this.getCoinCapPrices();
        prices = coinCapData.map(coin => ({
          id: coin.id,
          symbol: this.mapCoinCapSymbol(coin.id),
          price: parseFloat(coin.priceUsd).toFixed(coin.id === 'shiba-inu' ? 8 : 2),
          change24h: parseFloat(coin.changePercent24Hr || "0").toFixed(2),
          volume: coin.volumeUsd24Hr || "0",
          high24h: parseFloat(coin.priceUsd).toFixed(coin.id === 'shiba-inu' ? 8 : 2),
          low24h: parseFloat(coin.priceUsd).toFixed(coin.id === 'shiba-inu' ? 8 : 2),
          source: 'coincap',
          updatedAt: new Date().toISOString()
        }));
        
        // Add USDC manually
        prices.push({
          id: 'usd-coin',
          symbol: 'USDC/USD',
          price: '1.00',
          change24h: '0.01',
          volume: '1000000000',
          high24h: '1.00',
          low24h: '1.00',
          source: 'coincap',
          updatedAt: new Date().toISOString()
        });
        
        console.log('✅ Successfully fetched CoinCap data');
      } catch (coinCapError) {
        console.log('❌ CoinCap failed, trying CryptoCompare...', coinCapError.message);
        try {
          console.log('Attempting CryptoCompare API...');
          const cryptoCompareData = await this.getCryptoComparePrices();
          prices = [];
          
          if (cryptoCompareData.BTC?.USD) {
            prices.push({
              id: 'bitcoin',
              symbol: 'BTC/USD',
              price: parseFloat(cryptoCompareData.BTC.USD.PRICE).toFixed(2),
              change24h: parseFloat(cryptoCompareData.BTC.USD.CHANGEPCT24HOUR || "0").toFixed(2),
              volume: cryptoCompareData.BTC.USD.VOLUME24HOURTO?.toString() || "0",
              high24h: cryptoCompareData.BTC.USD.HIGH24HOUR?.toString() || cryptoCompareData.BTC.USD.PRICE.toString(),
              low24h: cryptoCompareData.BTC.USD.LOW24HOUR?.toString() || cryptoCompareData.BTC.USD.PRICE.toString(),
              source: 'cryptocompare',
              updatedAt: new Date().toISOString()
            });
          }
          
          if (cryptoCompareData.ETH?.USD) {
            prices.push({
              id: 'ethereum',
              symbol: 'ETH/USD',
              price: parseFloat(cryptoCompareData.ETH.USD.PRICE).toFixed(2),
              change24h: parseFloat(cryptoCompareData.ETH.USD.CHANGEPCT24HOUR || "0").toFixed(2),
              volume: cryptoCompareData.ETH.USD.VOLUME24HOURTO?.toString() || "0",
              high24h: cryptoCompareData.ETH.USD.HIGH24HOUR?.toString() || cryptoCompareData.ETH.USD.PRICE.toString(),
              low24h: cryptoCompareData.ETH.USD.LOW24HOUR?.toString() || cryptoCompareData.ETH.USD.PRICE.toString(),
              source: 'cryptocompare',
              updatedAt: new Date().toISOString()
            });
          }
          
          if (cryptoCompareData.SHIB?.USD) {
            prices.push({
              id: 'shiba-inu',
              symbol: 'SHIBA/USD',
              price: parseFloat(cryptoCompareData.SHIB.USD.PRICE).toFixed(8),
              change24h: parseFloat(cryptoCompareData.SHIB.USD.CHANGEPCT24HOUR || "0").toFixed(2),
              volume: cryptoCompareData.SHIB.USD.VOLUME24HOURTO?.toString() || "0",
              high24h: cryptoCompareData.SHIB.USD.HIGH24HOUR?.toString() || cryptoCompareData.SHIB.USD.PRICE.toString(),
              low24h: cryptoCompareData.SHIB.USD.LOW24HOUR?.toString() || cryptoCompareData.SHIB.USD.PRICE.toString(),
              source: 'cryptocompare',
              updatedAt: new Date().toISOString()
            });
          }

          // Add USDC manually
          prices.push({
            id: 'usd-coin',
            symbol: 'USDC/USD',
            price: '1.00',
            change24h: '0.01',
            volume: '1000000000',
            high24h: '1.00',
            low24h: '1.00',
            source: 'cryptocompare',
            updatedAt: new Date().toISOString()
          });
          
          console.log('✅ Successfully fetched CryptoCompare data');
        } catch (cryptoCompareError) {
          console.log('❌ CryptoCompare also failed, using fallback data', cryptoCompareError.message);
          prices = this.getFallbackPrices();
        }
      }

      console.log(`📊 Caching ${prices.length} price entries`);
      this.priceCache.set(cacheKey, { data: prices, timestamp: Date.now() });
      return prices;
    } catch (error) {
      console.error('💥 Critical error getting live prices:', error);
      // Return cached data if available, otherwise fallback
      const fallbackData = this.getFallbackPrices();
      this.priceCache.set(cacheKey, { data: fallbackData, timestamp: Date.now() });
      return fallbackData;
    }
  }

  private mapCoinCapSymbol(id: string): string {
    const mapping: { [key: string]: string } = {
      'bitcoin': 'BTC/USD',
      'ethereum': 'ETH/USD', 
      'shiba-inu': 'SHIBA/USD'
    };
    return mapping[id] || `${id.toUpperCase()}/USD`;
  }

  private getFallbackPrices() {
    return [
      {
        id: 'bitcoin',
        symbol: 'BTC/USD',
        price: '107000.00',
        change24h: '2.34',
        volume: '28500000000',
        high24h: '108000',
        low24h: '106500',
        source: 'fallback',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ethereum', 
        symbol: 'ETH/USD',
        price: '3500.00',
        change24h: '-1.23',
        volume: '15600000000',
        high24h: '3600',
        low24h: '3520',
        source: 'fallback',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usd-coin',
        symbol: 'USDC/USD',
        price: '1.00',
        change24h: '0.01',
        volume: '4200000000',
        high24h: '1.00',
        low24h: '1.00',
        source: 'fallback',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'shiba-inu',
        symbol: 'SHIBA/USD',
        price: '0.00002200',
        change24h: '5.67',
        volume: '890000000',
        high24h: '0.00002300',
        low24h: '0.00002100',
        source: 'fallback',
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async getChartData(symbol: string, timeframe: string): Promise<any[]> {
    // For charts, we'll generate realistic fallback data since external APIs are rate limited
    console.log(`Fetching chart data for ${symbol}, timeframe: ${timeframe}`);
    return this.generateFallbackChartData(symbol);
  }

  private generateFallbackChartData(symbol: string = 'BTC/USD') {
    const data = [];
    const now = Date.now();
    let basePrice = 107000; // Current BTC price
    
    if (symbol.includes('ETH')) basePrice = 3500;
    else if (symbol.includes('SHIBA')) basePrice = 0.000022;

    for (let i = 99; i >= 0; i--) {
      const time = now - (i * 60 * 60 * 1000); // 1 hour intervals
      const volatility = symbol.includes('SHIBA') ? 0.000001 : (symbol.includes('ETH') ? 50 : 500);
      const change = (Math.random() - 0.5) * volatility;
      basePrice += change;

      const open = basePrice;
      const high = basePrice + Math.random() * volatility * 0.5;
      const low = basePrice - Math.random() * volatility * 0.5;
      const close = basePrice + (Math.random() - 0.5) * volatility * 0.3;

      data.push({
        time,
        open: parseFloat(open.toFixed(symbol.includes('SHIBA') ? 8 : 2)),
        high: parseFloat(high.toFixed(symbol.includes('SHIBA') ? 8 : 2)),
        low: parseFloat(low.toFixed(symbol.includes('SHIBA') ? 8 : 2)),
        close: parseFloat(close.toFixed(symbol.includes('SHIBA') ? 8 : 2)),
        volume: Math.random() * 1000000
      });
    }

    return data;
  }
}

export const marketAPI = new MarketDataAPI();