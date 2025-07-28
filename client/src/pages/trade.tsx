import { useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import TradingChart from "@/components/trading/chart";
import TradingForm from "@/components/trading/trading-form";
import PositionsTable from "@/components/trading/positions-table";
import MarketStats from "@/components/trading/market-stats";

const availablePairs = [
  { symbol: "BTC/USD", icon: "₿", price: 67235.42, change: 2.34 },
  { symbol: "ETH/USD", icon: "Ξ", price: 3567.89, change: -1.23 },
  { symbol: "SHIBA/USD", icon: "🐕", price: 0.000022, change: 5.67 },
];

export default function TradePage() {
  const { marketData, isConnected } = useWebSocket();
  const [selectedPair, setSelectedPair] = useState(availablePairs[0]);
  
  const currentData = marketData.find(data => data.symbol === selectedPair.symbol);
  const currentPrice = currentData ? parseFloat(currentData.price) : selectedPair.price;
  const change24h = currentData ? parseFloat(currentData.change24h || selectedPair.change.toString()) : selectedPair.change;

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
                      <span className={`ml-auto text-sm ${pair.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {pair.change >= 0 ? '+' : ''}{pair.change}%
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-sm text-shiba-text-muted">[{selectedPair.symbol.replace("/", "-")}]</span>
              {!isConnected && (
                <Badge variant="outline" className="text-xs">
                  Disconnected
                </Badge>
              )}
            </div>
            <div>
              <div className="text-xl font-bold">${currentPrice.toLocaleString()}</div>
              <div className={`text-sm ${change24h >= 0 ? 'text-shiba-success' : 'text-shiba-error'}`}>
                {change24h >= 0 ? '+' : ''}{change24h}%
              </div>
            </div>
          </div>
          <div className="flex space-x-8 text-sm">
            <div>
              <div className="text-shiba-text-muted">24h Volume</div>
              <div className="font-semibold">$12.4M</div>
            </div>
            <div>
              <div className="text-shiba-text-muted">Open Interest</div>
              <div className="font-semibold">$89.2M</div>
            </div>
            <div>
              <div className="text-shiba-text-muted">Available Liquidity</div>
              <div className="font-semibold">$45.8M</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart and Positions Section */}
        <div className="lg:col-span-3 space-y-6">
          <TradingChart 
            symbol={selectedPair.symbol} 
            price={currentPrice} 
            change={change24h} 
          />
          <PositionsTable />
        </div>

        {/* Trading Panel */}
        <div className="space-y-6">
          <TradingForm symbol={selectedPair.symbol} price={currentPrice} />
          <MarketStats 
            symbol={selectedPair.symbol}
            poolValue="$145.2M"
            longOI="$44.6M"
            shortOI="$44.6M"
            fundingRate="0.0045"
          />
        </div>
      </div>
    </div>
  );
}
