interface MarketStatsProps {
  symbol: string;
  poolValue: string;
  longOI: string;
  shortOI: string;
  fundingRate: string;
}

export default function MarketStats({ symbol, poolValue, longOI, shortOI, fundingRate }: MarketStatsProps) {
  // Safety check to prevent errors
  const safeSymbol = symbol || "BTC/USD";
  
  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Market Stats</h3>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-shiba-text-muted">Pool</span>
          <span>{safeSymbol.replace("/", "-")}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-shiba-text-muted">Pool Value</span>
          <span>{poolValue}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-shiba-text-muted">Long OI</span>
          <span className="text-shiba-success">{longOI}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-shiba-text-muted">Short OI</span>
          <span className="text-shiba-error">{shortOI}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-shiba-text-muted">Funding Rate</span>
          <span className={`${parseFloat(fundingRate) >= 0 ? 'text-shiba-success' : 'text-shiba-error'}`}>
            {fundingRate}%
          </span>
        </div>
      </div>
      
      {/* OI Balance Indicator */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-shiba-text-muted mb-1">
          <span>Long</span>
          <span>Short</span>
        </div>
        <div className="w-full bg-shiba-dark rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-shiba-success to-shiba-error" style={{ width: "50%" }}></div>
        </div>
        <div className="flex justify-between text-xs text-shiba-text-muted mt-1">
          <span>50%</span>
          <span>50%</span>
        </div>
      </div>
    </div>
  );
}
