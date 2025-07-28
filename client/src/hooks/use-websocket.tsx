import { useState, useEffect, useCallback } from "react";
import type { MarketData } from "@shared/schema";

interface WebSocketData {
  type: string;
  data: MarketData[];
}

export function useWebSocket() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if we're on a deployed platform (no WebSocket support)
  const isServerless = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1' &&
                       !window.location.hostname.includes('.replit.dev') &&
                       (window.location.hostname.includes('.vercel.app') ||
                        window.location.hostname.includes('.netlify.app') ||
                        window.location.hostname.includes('shibainuunchained.com'));

  const fetchMarketData = useCallback(async () => {
    try {
      const apiUrl = isServerless ? '/api/market-data' : '/api/market-data';
      console.log("Fetching market data from:", apiUrl);
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        console.log("Market data fetched successfully:", data.length, "items");
        setMarketData(data);
        if (!isConnected) {
          setIsConnected(true);
          setError(null);
        }
      } else {
        const errorText = await response.text();
        console.error(`HTTP ${response.status}: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (err) {
      console.error("Error fetching market data:", err);
      setError("Failed to fetch market data");
      setIsConnected(false);
    }
  }, [isConnected]);

  const connect = useCallback(() => {
    if (isServerless) {
      // Use HTTP polling for serverless platforms
      console.log("Using HTTP polling for serverless deployment");
      fetchMarketData();
      return null;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log("Attempting WebSocket connection to:", wsUrl);
      
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("Connected to WebSocket");
        setIsConnected(true);
        setError(null);
      };

      socket.onmessage = (event) => {
        try {
          const data: WebSocketData = JSON.parse(event.data);
          
          if (data.type === "market_data") {
            setMarketData(data.data);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      socket.onclose = () => {
        console.log("Disconnected from WebSocket");
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (!isConnected) {
            connect();
          }
        }, 3000);
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("WebSocket connection error");
        setIsConnected(false);
      };

      return socket;
    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
      setError("Failed to establish WebSocket connection");
      return null;
    }
  }, [isConnected, isServerless, fetchMarketData]);

  useEffect(() => {
    const socket = connect();
    
    let pollInterval: NodeJS.Timeout;
    
    if (isServerless) {
      // Poll every 10 seconds for deployed platforms to avoid rate limits
      pollInterval = setInterval(fetchMarketData, 10000);
    }
    
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [connect, fetchMarketData, isServerless]);

  const getBTCData = useCallback(() => {
    return marketData.find(data => data.symbol === "BTC/USD");
  }, [marketData]);

  const getETHData = useCallback(() => {
    return marketData.find(data => data.symbol === "ETH/USD");
  }, [marketData]);

  const getMarketDataBySymbol = useCallback((symbol: string) => {
    return marketData.find(data => data.symbol === symbol);
  }, [marketData]);

  return {
    marketData,
    isConnected,
    error,
    getBTCData,
    getETHData,
    getMarketDataBySymbol,
  };
}
