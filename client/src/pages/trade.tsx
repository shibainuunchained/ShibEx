import { useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import TradingChart from "@/components/trading/chart";
import { TradingForm } from "@/components/trading/trading-form";
import PositionsTable from "@/components/trading/positions-table";
import MarketStats from "@/components/trading/market-stats";

const availablePairs = [
  { symbol: "BTC/USD", icon: "₿", price: 107234.56, change: 2.34 },
  { symbol: "ETH/USD", icon: "Ξ", price: 3521.89, change: -0.87 },
  { symbol: "SHIBA/USD", icon: "🐕", price: 0.00002198, change: 4.23 },
];

export default function TradePage() {
  const { marketData, isConnected } = useWebSocket();
  const [selectedPair, setSelectedPair] = useState(availablePairs[0]);
  
  // Safe price extraction with fallbacks
  const getCurrentPrice = () => {
    try {
      const currentData = marketData.find(data => data.symbol === selectedPair.symbol);
      return currentData ? parseFloat(currentData.price) : selectedPair.price;
    } catch (error) {
      console.warn("Error getting current price:", error);
      return selectedPair.price;
    }
  };

  const getCurrentChange = () => {
    try {
      const currentData = marketData.find(data => data.symbol === selectedPair.symbol);
      return currentData ? parseFloat(currentData.change24h || "0") : selectedPair.change;
    } catch (error) {
      console.warn("Error getting current change:", error);
      return selectedPair.change;
    }
  };

  const currentPrice = getCurrentPrice();
  const change24h = getCurrentChange();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Market Info Bar */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-lg font-semibold">
                    <span className="text-2xl">{selectedPair.icon}</span>
                    <span>{selectedPair.symbol}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {availablePairs.map((pair) => (
                    <DropdownMenuItem 
                      key={pair.symbol}
                      onClick={() => setSelectedPair(pair)}
                      className="flex items-center space-x-2"
                    >
                      <span className="text-lg">{pair.icon}</span>
                      <span>{pair.symbol}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex items-center space-x-1">
              <span className="text-2xl font-bold">
                ${currentPrice.toFixed(selectedPair.symbol.includes('SHIBA') ? 8 : 2)}
              </span>
              <Badge 
                variant={change24h >= 0 ? "default" : "destructive"}
                className={change24h >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-shiba-text-muted">
                {isConnected ? 'Live Prices' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-3 space-y-6">
          <TradingChart 
            symbol={selectedPair.symbol} 
            price={currentPrice} 
            change={change24h}
          />
          <MarketStats 
            symbol={selectedPair.symbol}
            poolValue="$2.5M"
            longOI="$1.2M"
            shortOI="$1.3M"
            fundingRate="0.025"
          />
        </div>
        
        {/* Trading Form */}
        <div className="space-y-6">
          <TradingForm 
            selectedPair={selectedPair.symbol}
            currentPrice={currentPrice}
          />
        </div>
      </div>

      {/* Positions Table */}
      <div className="mt-8">
        <PositionsTable />
      </div>
    </div>
  );
}
