import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Repeat,
  PiggyBank,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useWallet } from "@/hooks/use-wallet";
import { useTradingData } from "@/hooks/use-trading";

const portfolioStats = [
  {
    title: "Total Portfolio",
    value: "$24,567.89",
    change: "+12.5% (24h)",
    icon: "💼",
    changeColor: "text-shiba-success"
  },
  {
    title: "Unrealized PnL",
    value: "+$1,234.56",
    change: "Across all positions",
    icon: "📈",
    changeColor: "text-shiba-text-muted"
  },
  {
    title: "Trading Volume",
    value: "$156.7K",
    change: "Last 30 days",
    icon: "🔄",
    changeColor: "text-shiba-text-muted"
  },
  {
    title: "Win Rate",
    value: "68.5%",
    change: "Last 100 trades",
    icon: "🎯",
    changeColor: "text-shiba-text-muted"
  }
];

const portfolioComposition = [
  { name: "Bitcoin (BTC)", value: "$12,345", percentage: "50.3%", color: "bg-yellow-500" },
  { name: "Ethereum (ETH)", value: "$7,890", percentage: "32.1%", color: "bg-gray-400" },
  { name: "USDC", value: "$3,456", percentage: "14.1%", color: "bg-blue-500" },
  { name: "SHIBA", value: "$876", percentage: "3.5%", color: "bg-shiba-orange" }
];

const recentTrades = [
  {
    market: "BTC/USD Long",
    time: "2 hours ago",
    pnl: "+$456.78",
    percentage: "+2.34%",
    isProfit: true
  },
  {
    market: "ETH/USD Short",
    time: "1 day ago",
    pnl: "-$123.45",
    percentage: "-1.23%",
    isProfit: false
  },
  {
    market: "BTC/USD Long",
    time: "3 days ago",
    pnl: "+$789.01",
    percentage: "+5.67%",
    isProfit: true
  }
];

export default function DashboardPage() {
  const { balances } = useWallet();
  const { usePositions, useOrders, useTrades } = useTradingData();

  // Get user trading data
  const { data: positions = [] } = usePositions("demo-user");
  const { data: orders = [] } = useOrders("demo-user");
  const { data: trades = [] } = useTrades("demo-user");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Portfolio Dashboard</h1>
        <p className="text-shiba-text-secondary">Track your trading performance and portfolio analytics</p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {portfolioStats.map((stat) => (
          <Card key={stat.title} className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-lg font-semibold">{stat.title}</CardTitle>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className={`text-sm ${stat.changeColor}`}>{stat.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Portfolio Composition */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Portfolio Composition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {portfolioComposition.map((asset) => (
              <div key={asset.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 ${asset.color} rounded-full`}></div>
                  <span>{asset.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{asset.value}</div>
                  <div className="text-sm text-shiba-text-muted">{asset.percentage}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Recent Trades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTrades.map((trade, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div>
                  <div className="font-semibold">{trade.market}</div>
                  <div className="text-sm text-shiba-text-muted">{trade.time}</div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${trade.isProfit ? 'text-shiba-success' : 'text-shiba-error'}`}>
                    {trade.pnl}
                  </div>
                  <div className="text-sm text-shiba-text-muted">{trade.percentage}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-shiba-primary" />
              Trade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-shiba-text-muted mb-4">Start trading with leverage</p>
            <Button asChild className="w-full">
              <Link href="/trade">Start Trading</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-shiba-accent" />
              Swap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-shiba-text-muted mb-4">Exchange tokens instantly</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/swap">Swap Tokens</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-green-500" />
              Earn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-shiba-text-muted mb-4">Earn rewards through staking</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/earn">Start Earning</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}