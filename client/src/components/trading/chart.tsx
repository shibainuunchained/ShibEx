import { useEffect, useRef, useState, useCallback } from "react";

interface TradingChartProps {
  symbol: string;
  price: number;
  change: number;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function TradingChart({ symbol, price, change }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  const createTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Convert symbol format for TradingView
  const getTradingViewSymbol = useCallback((symbol: string) => {
    const symbolMap: { [key: string]: string } = {
      'BTC/USD': 'BINANCE:BTCUSDT',
      'ETH/USD': 'BINANCE:ETHUSDT',
      'SHIBA/USD': 'BINANCE:SHIBUSDT'
    };
    return symbolMap[symbol] || 'BINANCE:BTCUSDT';
  }, []);

  // Create TradingView widget with debouncing
  const createWidget = useCallback(() => {
    if (!containerRef.current) return;

    // Clear any pending widget creation
    if (createTimeoutRef.current) {
      clearTimeout(createTimeoutRef.current);
    }

    setIsLoading(true);
    
    // Debounce widget creation to prevent rapid recreations
    createTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;

      // Clear existing content
      containerRef.current.innerHTML = '';
      
      // Create new container div for the widget
      const widgetContainer = document.createElement('div');
      widgetContainer.id = `tradingview_${Date.now()}`;
      widgetContainer.style.height = '100%';
      widgetContainer.style.width = '100%';
      containerRef.current.appendChild(widgetContainer);

      // Create script element
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.async = true;
      
      const config = {
        "autosize": true,
        "symbol": getTradingViewSymbol(symbol),
        "interval": "60",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "allow_symbol_change": false,
        "container_id": widgetContainer.id,
        "hide_top_toolbar": true,
        "hide_legend": false,
        "save_image": false,
        "backgroundColor": "rgba(15, 15, 19, 1)",
        "gridColor": "rgba(55, 65, 81, 0.3)",
        "overrides": {
          "paneProperties.background": "#0f0f13",
          "paneProperties.backgroundType": "solid",
          "paneProperties.backgroundGradientStartColor": "#0f0f13", 
          "paneProperties.backgroundGradientEndColor": "#0f0f13",
          "paneProperties.vertGridProperties.color": "rgba(55, 65, 81, 0.3)",
          "paneProperties.horzGridProperties.color": "rgba(55, 65, 81, 0.3)",
          "symbolWatermarkProperties.transparency": 90,
          "scalesProperties.textColor": "#9ca3af",
          "scalesProperties.backgroundColor": "#0f0f13"
        }
      };

      script.innerHTML = JSON.stringify(config);
      
      // Add load event listener
      script.onload = () => {
        setTimeout(() => setIsLoading(false), 1000);
      };
      
      script.onerror = () => {
        setIsLoading(false);
        console.log('TradingView script failed to load');
      };
      
      widgetContainer.appendChild(script);
      setCurrentSymbol(symbol);
    }, 500); // 500ms debounce
  }, [symbol, getTradingViewSymbol]);

  // Initialize widget
  useEffect(() => {
    createWidget();
    
    return () => {
      if (createTimeoutRef.current) {
        clearTimeout(createTimeoutRef.current);
      }
    };
  }, [createWidget]);

  // Update widget when symbol changes (with debouncing)
  useEffect(() => {
    if (symbol !== currentSymbol) {
      createWidget();
    }
  }, [symbol, currentSymbol, createWidget]);

  return (
    <div className="glass-card p-6 h-96">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">{symbol}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">${price.toLocaleString()}</span>
            <span className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isLoading && (
            <div className="flex items-center space-x-1">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent"></div>
              <span className="text-xs text-shiba-text-muted">Loading...</span>
            </div>
          )}
          <span className="text-xs text-shiba-text-muted">TradingView</span>
        </div>
      </div>

      <div className="relative h-full chart-container rounded-lg overflow-hidden bg-shiba-dark">
        <div 
          ref={containerRef}
          className="w-full h-full"
          style={{ height: '300px' }}
        />
      </div>
    </div>
  );
}