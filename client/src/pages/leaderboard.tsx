import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const leaderboardData = [
  {
    rank: 1,
    trader: "ShibaKing.eth",
    address: "0x1234...5678",
    pnl: "+$45,678",
    volume: "$1.2M",
    winRate: "89.5%",
    roi: "+234.5%",
    badge: "👑"
  },
  {
    rank: 2,
    trader: "CryptoWolf",
    address: "0x2345...6789",
    pnl: "+$32,145",
    volume: "$890K",
    winRate: "76.3%",
    roi: "+189.2%",
    badge: "🥈"
  },
  {
    rank: 3,
    trader: "DegenTrader",
    address: "0x3456...7890",
    pnl: "+$28,934",
    volume: "$756K",
    winRate: "82.1%",
    roi: "+156.8%",
    badge: "🥉"
  },
  {
    rank: 4,
    trader: "LeverageLord",
    address: "0x4567...8901",
    pnl: "+$21,567",
    volume: "$634K",
    winRate: "71.8%",
    roi: "+143.9%",
    badge: null
  },
  {
    rank: 5,
    trader: "ShibaWhale",
    address: "0x5678...9012",
    pnl: "+$19,234",
    volume: "$567K",
    winRate: "68.5%",
    roi: "+128.7%",
    badge: null
  }
];

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState("7d");

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-black";
      case 3:
        return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
      default:
        return "bg-shiba-card text-shiba-text-primary";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Trading Leaderboard</h1>
        <p className="text-shiba-text-secondary">Top performers on the ShibaU platform</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6">
          {/* Timeframe Selection */}
          <div className="flex space-x-2 mb-6">
            {["7d", "30d", "all"].map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "default" : "ghost"}
                onClick={() => setTimeframe(period)}
                className={timeframe === period ? "bg-shiba-orange" : ""}
              >
                {period === "7d" ? "7 Days" : period === "30d" ? "30 Days" : "All Time"}
              </Button>
            ))}
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-4 text-sm text-shiba-text-muted border-b border-border pb-4 mb-4 min-w-[600px]">
              <div>Rank</div>
              <div>Trader</div>
              <div>PnL</div>
              <div>Volume</div>
              <div>Win Rate</div>
              <div>ROI</div>
            </div>

            <div className="space-y-2 min-w-[600px]">
              {leaderboardData.map((trader) => (
                <div key={trader.rank} className="grid grid-cols-6 gap-4 text-sm items-center py-4 border-b border-border/50 hover:bg-shiba-card/30 transition-colors rounded-lg px-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getRankStyle(trader.rank)}`}>
                      {trader.rank}
                    </div>
                    {trader.badge && <span className="text-lg">{trader.badge}</span>}
                  </div>
                  <div>
                    <div className="font-semibold">{trader.trader}</div>
                    <div className="text-shiba-text-muted text-xs">{trader.address}</div>
                  </div>
                  <div className="text-shiba-success font-semibold">{trader.pnl}</div>
                  <div>{trader.volume}</div>
                  <div>{trader.winRate}</div>
                  <div className="text-shiba-success">{trader.roi}</div>
                </div>
              ))}
            </div>

            {/* User Rank */}
            <div className="mt-6 text-center">
              <div className="bg-shiba-dark rounded-lg p-4 inline-block">
                <div className="text-sm text-shiba-text-muted mb-2">Your Rank</div>
                <div className="text-2xl font-bold">#247</div>
                <div className="text-sm text-shiba-success">+$2,345 PnL</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
