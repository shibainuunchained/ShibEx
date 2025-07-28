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
  const priceUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch live prices from CoinGecko API (free tier, reliable)
  const fetchLivePrices = async () => {
    try {
      // Use CoinGecko's simple price API (free tier, no auth required)
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,shiba-inu&vs_currencies=usd&include_24hr_change=true',
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        const updatedData: MarketData[] = [
          {
            symbol: "BTC/USD",
            price: data.bitcoin?.usd?.toString() || "67235.42",
            change24h: data.bitcoin?.usd_24h_change?.toFixed(2) || "2.34"
          },
          {
            symbol: "ETH/USD", 
            price: data.ethereum?.usd?.toString() || "3567.89",
            change24h: data.ethereum?.usd_24h_change?.toFixed(2) || "-1.23"
          },
          {
            symbol: "SHIBA/USD",
            price: data['shiba-inu']?.usd?.toFixed(8) || "0.000022",
            change24h: data['shiba-inu']?.usd_24h_change?.toFixed(2) || "5.67"
          }
        ];

        setMarketData(updatedData);
        setIsConnected(true);
        console.log('✅ Live prices updated successfully');
        return true;
      }
    } catch (error) {
      console.log('❌ CoinGecko API failed:', error);
    }

    // Fallback: Try our backend API
    try {
      const response = await fetch('/api/market-data');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setMarketData(data);
          setIsConnected(true);
          console.log('✅ Backend API prices updated');
          return true;
        }
      }
    } catch (error) {
      console.log('❌ Backend API failed:', error);
    }

    console.log('⚠️ Using cached/default prices');
    setIsConnected(false);
    return false;
  };

  // Try WebSocket connection (if available)
  const connectWebSocket = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('🔌 WebSocket connected');
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
            console.log('📡 WebSocket prices updated');
          }
        } catch (error) {
          console.log('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('🔌 WebSocket disconnected - switching to HTTP polling');
        setIsConnected(false);
        
        // Switch to HTTP polling when WebSocket fails
        if (!priceUpdateIntervalRef.current) {
          startPricePolling();
        }
        
        // Try to reconnect WebSocket after 30 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 30000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.log('🔌 WebSocket error - switching to HTTP polling');
        setIsConnected(false);
      };

    } catch (error) {
      console.log('Failed to create WebSocket - using HTTP polling');
      setIsConnected(false);
      startPricePolling();
    }
  };

  // Start HTTP polling for price updates
  const startPricePolling = () => {
    if (priceUpdateIntervalRef.current) return;
    
    console.log('🔄 Starting HTTP price polling (every 10 seconds)');
    
    // Immediate fetch
    fetchLivePrices();
    
    // Set up polling interval
    priceUpdateIntervalRef.current = setInterval(() => {
      fetchLivePrices();
    }, 10000); // Update every 10 seconds
  };

  useEffect(() => {
    // Start with immediate price fetch
    fetchLivePrices();
    
    // Try WebSocket connection
    connectWebSocket();
    
    // Start HTTP polling as backup
    const pollingTimeout = setTimeout(() => {
      if (!isConnected) {
        startPricePolling();
      }
    }, 5000);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (priceUpdateIntervalRef.current) {
        clearInterval(priceUpdateIntervalRef.current);
      }
      clearTimeout(pollingTimeout);
    };
  }, []);

  return { marketData, isConnected };
}
