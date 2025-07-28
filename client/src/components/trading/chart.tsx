import { useEffect, useRef } from "react";

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
  const widgetRef = useRef<any>(null);

  // Convert symbol format for TradingView
  const getTradingViewSymbol = (symbol: string) => {
    const symbolMap: { [key: string]: string } = {
      'BTC/USD': 'BINANCE:BTCUSDT',
      'ETH/USD': 'BINANCE:ETHUSDT',
      'SHIBA/USD': 'BINANCE:SHIBUSDT'
    };
    return symbolMap[symbol] || 'BINANCE:BTCUSDT';
  };

  useEffect(() => {
    // Load TradingView script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": getTradingViewSymbol(symbol),
      "interval": "60",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "toolbar_bg": "#f1f3f6",
      "enable_publishing": false,
      "allow_symbol_change": false,
      "container_id": "tradingview_chart",
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "backgroundColor": "rgba(15, 15, 19, 1)",
      "gridColor": "rgba(55, 65, 81, 0.3)",
      "studies": [
        "Volume@tv-basicstudies"
      ],
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
    });

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol]);

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
          <span className="text-xs text-shiba-text-muted">Powered by TradingView</span>
        </div>
      </div>

      <div className="relative h-full chart-container rounded-lg overflow-hidden bg-shiba-dark">
        <div 
          ref={containerRef}
          id="tradingview_chart"
          className="w-full h-full"
          style={{ height: '300px' }}
        />
      </div>
    </div>
  );
}