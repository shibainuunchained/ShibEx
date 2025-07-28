import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useWallet } from "@/hooks/use-wallet";

export default function Navigation() {
  const [location] = useLocation();
  const { user, isConnected, isConnecting, connect, disconnect, balance } = useWallet();

  const navItems = [
    { path: "/trade", label: "Trade" },
    { path: "/earn", label: "Earn" },
    { path: "/buy", label: "Buy" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/leaderboard", label: "Leaderboard" },
    { path: "/referrals", label: "Referrals" },
    { path: "/swap", label: "Swap" },
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 glass-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center p-1">
              <div className="w-full h-full bg-yellow-200 rounded-full flex items-center justify-center">
                <span className="text-lg">🐕</span>
              </div>
            </div>
            <span className="text-xl font-bold text-shiba-text-primary">ShibEx</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={`nav-tab ${
                    location === item.path || (location === "/" && item.path === "/trade")
                      ? "active"
                      : ""
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 bg-shiba-card px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-shiba-success rounded-full animate-pulse"></div>
              <span className="text-sm text-shiba-text-secondary">Arbitrum</span>
            </div>
            
            {isConnected && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="shiba-gradient hover:opacity-90 transition-opacity">
                    {formatAddress(user.address)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="p-3">
                    <div className="text-sm font-medium mb-2">Wallet Balance</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>₿ BTC:</span>
                        <span>{balance.BTC}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ξ ETH:</span>
                        <span>{balance.ETH}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>💰 USDC:</span>
                        <span>{balance.USDC}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🐕 SHIBA:</span>
                        <span>{balance.SHIBA}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={disconnect} className="text-red-500">
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="shiba-gradient hover:opacity-90 transition-opacity"
                onClick={connect}
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
