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

  // Simplified price fetching with rate limiting
  const fetchLivePrices = async () => {
    const now = Date.now();
    // Rate limit: only fetch if last update was more than 30 seconds ago
    if (now - lastUpdateRef.current < 30000) {
      return false;
    }

    try {
      // Use backend API first (more reliable than direct CoinGecko)
      const response = await fetch('/api/market-data', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          // Convert backend data format to frontend format
          const formattedData = data.map((item: any) => ({
            symbol: item.symbol,
            price: item.price,
            change24h: item.change24h || "0.00"
          }));
          
          setMarketData(formattedData);
          setIsConnected(true);
          lastUpdateRef.current = now;
          console.log('💰 Prices updated from backend API');
          return true;
        }
      }
    } catch (error) {
      console.log('Backend API failed, keeping current prices');
    }

    // Don't try external APIs to avoid rate limiting
    setIsConnected(false);
    return false;
  };

  // Simulate live price movement for better UX
  const simulateLivePrices = () => {
    setMarketData(prevData => {
      return prevData.map(item => {
        const currentPrice = parseFloat(item.price);
        // Small random movement (±0.1%)
        const changePercent = (Math.random() - 0.5) * 0.002;
        const newPrice = currentPrice * (1 + changePercent);
        
        return {
          ...item,
          price: newPrice.toFixed(item.symbol === 'SHIBA/USD' ? 8 : 2)
        };
      });
    });
  };

  useEffect(() => {
    // Initial fetch
    fetchLivePrices();

    // Set up intervals
    const priceInterval = setInterval(() => {
      fetchLivePrices();
    }, 60000); // Fetch real prices every 60 seconds

    const simulationInterval = setInterval(() => {
      simulateLivePrices();
    }, 3000); // Simulate live movement every 3 seconds

    return () => {
      clearInterval(priceInterval);
      clearInterval(simulationInterval);
    };
  }, []);

  return { marketData, isConnected };
}
