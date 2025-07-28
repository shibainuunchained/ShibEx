import { useEffect, useState, useRef } from "react";

interface MarketData {
  symbol: string;
  price: string;
  change24h?: string;
  volume24h?: string;
}

export function useWebSocket() {
  const [marketData, setMarketData] = useState<MarketData[]>([
    { symbol: "BTC/USD", price: "67235.42", change24h: "2.34" },
    { symbol: "ETH/USD", price: "3567.89", change24h: "-1.23" },
    { symbol: "SHIBA/USD", price: "0.000022", change24h: "5.67" },
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const priceUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Fetch real-time prices from CoinCap (free, no rate limits)
  const fetchRealPrices = async () => {
    try {
      // CoinCap API - Free, no auth, no rate limits
      const response = await fetch('https://api.coincap.io/v2/assets?ids=bitcoin,ethereum,shiba-inu&limit=3', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          const formattedData: MarketData[] = result.data.map((coin: any) => {
            let symbol = "";
            if (coin.id === "bitcoin") symbol = "BTC/USD";
            else if (coin.id === "ethereum") symbol = "ETH/USD";
            else if (coin.id === "shiba-inu") symbol = "SHIBA/USD";

            return {
              symbol,
              price: coin.id === "shiba-inu" 
                ? parseFloat(coin.priceUsd).toFixed(8)
                : parseFloat(coin.priceUsd).toFixed(2),
              change24h: parseFloat(coin.changePercent24Hr || "0").toFixed(2)
            };
          });

          setMarketData(formattedData);
          setIsConnected(true);
          lastUpdateRef.current = Date.now();
          console.log('✅ Real prices updated from CoinCap');
          return true;
        }
      }
    } catch (error) {
      console.log('CoinCap API failed:', error);
    }

    // Fallback to Crypto Compare (also free)
    try {
      const response = await fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,SHIB&tsyms=USD');
      if (response.ok) {
        const result = await response.json();
        if (result.RAW) {
          const formattedData: MarketData[] = [
            {
              symbol: "BTC/USD",
              price: result.RAW.BTC?.USD?.PRICE?.toFixed(2) || "67235.42",
              change24h: result.RAW.BTC?.USD?.CHANGEPCT24HOUR?.toFixed(2) || "2.34"
            },
            {
              symbol: "ETH/USD",
              price: result.RAW.ETH?.USD?.PRICE?.toFixed(2) || "3567.89",
              change24h: result.RAW.ETH?.USD?.CHANGEPCT24HOUR?.toFixed(2) || "-1.23"
            },
            {
              symbol: "SHIBA/USD",
              price: result.RAW.SHIB?.USD?.PRICE?.toFixed(8) || "0.000022",
              change24h: result.RAW.SHIB?.USD?.CHANGEPCT24HOUR?.toFixed(2) || "5.67"
            }
          ];

          setMarketData(formattedData);
          setIsConnected(true);
          lastUpdateRef.current = Date.now();
          console.log('✅ Real prices updated from CryptoCompare');
          return true;
        }
      }
    } catch (error) {
      console.log('CryptoCompare API failed:', error);
    }

    // Final fallback to backend
    try {
      const response = await fetch('/api/market-data');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const formattedData = data.map((item: any) => ({
            symbol: item.symbol,
            price: item.price,
            change24h: item.change24h || "0.00"
          }));
          
          setMarketData(formattedData);
          setIsConnected(true);
          console.log('✅ Prices from backend API');
          return true;
        }
      }
    } catch (error) {
      console.log('Backend API failed');
    }

    console.log('⚠️ Using cached prices');
    setIsConnected(false);
    return false;
  };

  useEffect(() => {
    // Initial fetch
    fetchRealPrices();

    // Update real prices every 15 seconds (aggressive for real-time feel)
    const priceInterval = setInterval(() => {
      fetchRealPrices();
    }, 15000);

    return () => {
      clearInterval(priceInterval);
    };
  }, []);

  return { marketData, isConnected };
}
