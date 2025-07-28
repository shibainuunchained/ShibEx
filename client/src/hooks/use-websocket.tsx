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
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback to CoinGecko API when WebSocket fails
  const fetchCoinGeckoData = async () => {
    try {
      const response = await fetch('/api/market-data');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setMarketData(data);
          return true;
        }
      }
    } catch (error) {
      console.log('Fallback API failed, using static data');
    }
    return false;
  };

  // Initialize WebSocket connection with better error handling
  const connectWebSocket = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Clear any pending reconnection
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'market-data' && data.data) {
            setMarketData(data.data);
          }
        } catch (error) {
          console.log('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Start fallback mechanism
        if (!fallbackIntervalRef.current) {
          fallbackIntervalRef.current = setInterval(fetchCoinGeckoData, 10000);
        }
        
        // Attempt to reconnect after 5 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.log('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.log('Failed to create WebSocket connection:', error);
      setIsConnected(false);
      
      // Use fallback immediately if WebSocket creation fails
      fetchCoinGeckoData();
      if (!fallbackIntervalRef.current) {
        fallbackIntervalRef.current = setInterval(fetchCoinGeckoData, 10000);
      }
    }
  };

  useEffect(() => {
    // Try WebSocket first
    connectWebSocket();
    
    // Also start with a fallback fetch
    fetchCoinGeckoData();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
    };
  }, []);

  return { marketData, isConnected };
}
