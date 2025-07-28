import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface TradingChartProps {
  symbol: string;
  price: number;
  change: number;
}

interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function TradingChart({ symbol, price, change }: TradingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeframes = ["15s", "30s", "1m", "5m", "15m", "1h", "4h", "1D"];

  // Fetch real chart data from API
  const fetchChartData = async (timeframe: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chart/${encodeURIComponent(symbol)}/${timeframe}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data) && data.length > 0) {
          setChartData(data);
        } else {
          console.log('API returned empty data, using fallback');
          generateFallbackData();
        }
      } else {
        console.log(`Chart API response: ${response.status}, using fallback data`);
        generateFallbackData();
      }
    } catch (error) {
      console.log('Chart API error, using fallback data:', error);
      generateFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  // Generate fallback data when real API is unavailable
  const generateFallbackData = () => {
    const data = [];
    let currentPrice = price;
    const now = Date.now();

    for (let i = 99; i >= 0; i--) {
      const time = now - (i * getTimeInterval(selectedTimeframe));
      const change = (Math.random() - 0.5) * (price * 0.02);
      currentPrice += change;

      const open = currentPrice;
      const close = currentPrice + (Math.random() - 0.5) * (price * 0.01);
      const high = Math.max(open, close) + Math.random() * (price * 0.005);
      const low = Math.min(open, close) - Math.random() * (price * 0.005);
      const volume = Math.random() * 1000000;

      data.push({ time, open, high, low, close, volume });
      currentPrice = close;
    }

    setChartData(data);
  };

  const getTimeInterval = (timeframe: string): number => {
    switch (timeframe) {
      case '15s': return 15 * 1000;
      case '30s': return 30 * 1000;
      case '1m': return 60 * 1000;
      case '5m': return 5 * 60 * 1000;
      case '15m': return 15 * 60 * 1000;
      case '1h': return 60 * 60 * 1000;
      case '4h': return 4 * 60 * 60 * 1000;
      case '1D': return 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000;
    }
  };

  // Fetch data when symbol or timeframe changes
  useEffect(() => {
    fetchChartData(selectedTimeframe);
  }, [symbol, selectedTimeframe]);

  // Auto-refresh chart data every 1 second for real-time updates
  useEffect(() => {
    const getRefreshInterval = () => {
      return 1000; // 1 second for all timeframes for super dynamic updates
    };

    const interval = setInterval(() => {
      fetchChartData(selectedTimeframe);
    }, getRefreshInterval());

    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  // Update chart when price changes (real-time updates)
  useEffect(() => {
    if (chartData.length > 0) {
      const lastCandle = chartData[chartData.length - 1];
      const now = Date.now();
      
      // If current price has changed significantly, update the last candle
      if (Math.abs(price - lastCandle.close) > price * 0.001) {
        const updatedData = [...chartData];
        updatedData[updatedData.length - 1] = {
          ...lastCandle,
          close: price,
          high: Math.max(lastCandle.high, price),
          low: Math.min(lastCandle.low, price),
          time: now
        };
        setChartData(updatedData);
      }
    }
  }, [price, chartData]);

  // Draw chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = "#0f0f13";
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (chartData.length === 0) return;

    // Calculate price range
    const minPrice = Math.min(...chartData.map(c => c.low));
    const maxPrice = Math.max(...chartData.map(c => c.high));
    const priceRange = maxPrice - minPrice;

    if (priceRange === 0) return;

    // Draw candlesticks
    const candleWidth = (rect.width / chartData.length) * 0.7;
    const spacing = rect.width / chartData.length;

    chartData.forEach((candle, index) => {
      const x = index * spacing + spacing / 2;
      const openY = rect.height - ((candle.open - minPrice) / priceRange) * rect.height * 0.9;
      const closeY = rect.height - ((candle.close - minPrice) / priceRange) * rect.height * 0.9;
      const highY = rect.height - ((candle.high - minPrice) / priceRange) * rect.height * 0.9;
      const lowY = rect.height - ((candle.low - minPrice) / priceRange) * rect.height * 0.9;

      const isGreen = candle.close > candle.open;
      const color = isGreen ? "#00D4AA" : "#FF4747";

      // Draw wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = color;
      const bodyHeight = Math.abs(closeY - openY) || 1;
      ctx.fillRect(
        x - candleWidth / 2,
        Math.min(openY, closeY),
        candleWidth,
        bodyHeight
      );
    });

    // Draw price grid lines
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    for (let i = 1; i < 5; i++) {
      const y = (rect.height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw price labels
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";

    for (let i = 0; i <= 4; i++) {
      const priceLevel = minPrice + (priceRange * i / 4);
      const y = rect.height - (i / 4 * rect.height * 0.9) - 5;
      ctx.fillText(priceLevel.toFixed(2), rect.width - 10, y);
    }

  }, [chartData]);

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
  };

  return (
    <div className="glass-card p-6 h-96">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">{symbol}</h3>
          <div className="flex space-x-1">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={selectedTimeframe === tf ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => handleTimeframeChange(tf)}
                disabled={isLoading}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
          )}
          <Button variant="ghost" size="sm" onClick={() => fetchChartData(selectedTimeframe)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="relative h-full chart-container rounded-lg overflow-hidden bg-shiba-dark">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />
        {chartData.length === 0 && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-shiba-text-muted">
            No chart data available
          </div>
        )}
      </div>
    </div>
  );
}