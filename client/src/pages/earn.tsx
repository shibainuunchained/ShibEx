import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PiggyBank, Droplets, TrendingUp, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Mock data for staking pools
const stakingPools = [
  {
    id: "1",
    token: "SHIBA",
    apy: "125%",
    tvl: "$45.2M",
    rewards: "SHIBA",
    lockPeriod: "7 days",
    icon: "🐕"
  },
  {
    id: "2", 
    token: "BTC",
    apy: "8.5%",
    tvl: "$156.7M",
    rewards: "BTC",
    lockPeriod: "30 days",
    icon: "₿"
  },
  {
    id: "3",
    token: "ETH",
    apy: "12.3%",
    tvl: "$89.4M", 
    rewards: "ETH",
    lockPeriod: "14 days",
    icon: "Ξ"
  },
  {
    id: "4",
    token: "USDC",
    apy: "6.8%",
    tvl: "$234.1M",
    rewards: "USDC",
    lockPeriod: "No lock",
    icon: "$"
  }
];

export default function EarnPage() {
  // Get user's staking positions
  const { data: stakingPositions = [] } = useQuery({
    queryKey: ["/api/staking", "demo-user"],
    enabled: true
  });

  // Get user's liquidity positions
  const { data: liquidityPositions = [] } = useQuery({
    queryKey: ["/api/users", "demo-user", "liquidity"],
    enabled: true
  });

  // Get liquidity pools
  const { data: liquidityPools = [] } = useQuery({
    queryKey: ["/api/pools"],
    enabled: true
  });

  const [stakeAmount, setStakeAmount] = useState("");
  const [liquidityAmount, setLiquidityAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);
  const [selectedStakePool, setSelectedStakePool] = useState<string>("");
  const { toast } = useToast();
  const { user, isConnected, balance, refreshBalance, updateBalance } = useWallet();

  // Mock farming pools data
  const farmingPools = [
    {
      id: "1",
      pair: "BTC/USDC",
      tokens: ["₿", "$"],
      apr: "125%",
      tvl: "$45.2M",
      userStake: "$0.00",
      rewards: "$0.00"
    },
    {
      id: "2", 
      pair: "ETH/USDC",
      tokens: ["Ξ", "$"],
      apr: "89%",
      tvl: "$32.1M",
      userStake: "$0.00",
      rewards: "$0.00"
    },
    {
      id: "3",
      pair: "SHIB/USDC", 
      tokens: ["🐕", "$"],
      apr: "156%",
      tvl: "$18.7M",
      userStake: "$0.00",
      rewards: "$0.00"
    }
  ];

  const handleStake = async (poolId: string, token: string) => {
    if (!isConnected || !user) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to stake tokens",
        variant: "destructive",
      });
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid stake amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(stakeAmount);
    const availableBalance = parseFloat(balance[token as keyof typeof balance]?.replace(/,/g, '') || '0');

    if (amount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: `Not enough ${token}. Available: ${availableBalance.toFixed(6)}`,
        variant: "destructive",
      });
      return;
    }

    setIsStaking(true);
    try {
      const response = await apiRequest("POST", "/api/staking", {
        userId: user.id,
        token,
        amount,
        poolId,
        apy: stakingPools.find(p => p.token === token)?.apy || "0%",
        status: "ACTIVE"
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Staking failed');
      }

      // Update balance locally
      updateBalance(token, amount, 'subtract');
      
      // Refresh data
      await refreshBalance();

      toast({
        title: "Staking Successful",
        description: `Successfully staked ${stakeAmount} ${token} tokens`,
      });
      setStakeAmount("");
    } catch (error: any) {
      console.error('Staking error:', error);
      toast({
        title: "Staking Failed",
        description: error.message || "Failed to stake tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStaking(false);
    }
  };

  const handleAddLiquidity = async (poolId: string) => {
    if (!isConnected || !user) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to provide liquidity",
        variant: "destructive",
      });
      return;
    }

    if (!liquidityAmount || parseFloat(liquidityAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid liquidity amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(liquidityAmount);
    const usdcBalance = parseFloat(balance.USDC?.replace(/,/g, '') || '0');

    if (amount > usdcBalance) {
      toast({
        title: "Insufficient Balance",
        description: `Not enough USDC. Available: ${usdcBalance.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    setIsAddingLiquidity(true);
    try {
      // For simplicity, we'll add equal amounts of USDC and the paired token
      const pairedAmount = amount; // In a real scenario, this would be calculated based on the pool ratio

      const response = await apiRequest("POST", "/api/liquidity", {
        userId: user.id,
        poolId,
        token1: "USDC",
        token2: "BTC", // This would be dynamic based on the pool
        amount1: amount,
        amount2: pairedAmount / 67235, // Convert USDC to BTC
        status: "ACTIVE"
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Adding liquidity failed');
      }

      // Update balances locally
      updateBalance("USDC", amount, 'subtract');
      updateBalance("BTC", pairedAmount / 67235, 'subtract');

      // Refresh data
      await refreshBalance();

      toast({
        title: "Liquidity Added",
        description: `Successfully added ${liquidityAmount} USDC to liquidity pool`,
      });
      setLiquidityAmount("");
    } catch (error: any) {
      console.error('Liquidity error:', error);
      toast({
        title: "Adding Liquidity Failed",
        description: error.message || "Failed to add liquidity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Earn with ShibaU</h1>
        <p className="text-shiba-text-secondary">
          Provide liquidity and stake tokens to earn rewards from trading fees and protocol incentives.
        </p>
      </div>

      {/* User's Active Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* My Staking Positions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-shiba-primary" />
              My Staking Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stakingPositions.length > 0 ? (
              <div className="space-y-4">
                {stakingPositions.map((position: any) => (
                  <div key={position.id} className="flex items-center justify-between p-4 rounded-lg bg-shiba-dark/50">
                    <div>
                      <p className="font-semibold">{position.token}</p>
                      <p className="text-sm text-shiba-text-muted">
                        Staked: {position.amount} {position.token}
                      </p>
                      <p className="text-sm text-shiba-text-muted">
                        APY: {position.apy} | Status: {position.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500">
                        ${(position.amount * (position.token === 'BTC' ? 67235 : position.token === 'ETH' ? 3567 : position.token === 'USDC' ? 1 : 0.000022)).toFixed(2)}
                      </p>
                      <p className="text-sm text-shiba-text-muted">
                        {new Date(position.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-shiba-text-muted text-center py-4">No active staking positions</p>
            )}
          </CardContent>
        </Card>

        {/* My Liquidity Positions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              My Liquidity Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {liquidityPositions.length > 0 ? (
              <div className="space-y-4">
                {liquidityPositions.map((position: any) => (
                  <div key={position.id} className="flex items-center justify-between p-4 rounded-lg bg-shiba-dark/50">
                    <div>
                      <p className="font-semibold">{position.token1}/{position.token2}</p>
                      <p className="text-sm text-shiba-text-muted">
                        {position.amount1} {position.token1} + {position.amount2} {position.token2}
                      </p>
                      <p className="text-sm text-shiba-text-muted">
                        Shares: {position.shares} | Status: {position.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-500">
                        ${((position.amount1 * (position.token1 === 'BTC' ? 67235 : position.token1 === 'ETH' ? 3567 : 1)) + 
                           (position.amount2 * (position.token2 === 'BTC' ? 67235 : position.token2 === 'ETH' ? 3567 : 1))).toFixed(2)}
                      </p>
                      <p className="text-sm text-shiba-text-muted">
                        {new Date(position.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-shiba-text-muted text-center py-4">No active liquidity positions</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Staking Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-shiba-primary" />
              Staking Pools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stakingPools.map((pool) => (
              <div key={pool.id} className="p-4 rounded-lg bg-shiba-dark/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <span>{pool.icon}</span>
                      {pool.token}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-shiba-text-muted">
                      <span>APY: <span className="text-green-500 font-semibold">{pool.apy}</span></span>
                      <span>TVL: {pool.tvl}</span>
                      <span>Lock: {pool.lockPeriod}</span>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="shiba-gradient" disabled={!isConnected}>
                        {isConnected ? "Stake" : "Connect Wallet"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Stake {pool.token}</DialogTitle>
                        <DialogDescription>
                          Earn {pool.apy} APY by staking your {pool.token} tokens.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Amount ({pool.token})</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            className="text-white"
                          />
                          <div className="text-sm text-shiba-text-muted mt-1">
                            Balance: {balance[pool.token as keyof typeof balance]} {pool.token}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={() => handleStake(pool.id, pool.token)}
                          disabled={isStaking || !isConnected}
                          className="shiba-gradient"
                        >
                          {isStaking ? "Staking..." : "Stake"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Liquidity Pools Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              Liquidity Pools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {liquidityPools.length > 0 ? liquidityPools.map((pool: any) => (
              <div key={pool.id} className="p-4 rounded-lg bg-shiba-dark/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{pool.symbol}</h3>
                    <div className="flex items-center gap-4 text-sm text-shiba-text-muted">
                      <span>APR: <span className="text-blue-500 font-semibold">{pool.apr}%</span></span>
                      <span>TVL: ${parseFloat(pool.totalLiquidity).toFixed(2)}</span>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" disabled={!isConnected}>
                        {isConnected ? "Add Liquidity" : "Connect Wallet"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Liquidity to {pool.name}</DialogTitle>
                        <DialogDescription>
                          Provide liquidity to earn {pool.apr}% APR from trading fees.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Amount (USDC)</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={liquidityAmount}
                            onChange={(e) => setLiquidityAmount(e.target.value)}
                            className="text-white"
                          />
                          <div className="text-sm text-shiba-text-muted mt-1">
                            Balance: {balance.USDC} USDC
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={() => handleAddLiquidity(pool.id)}
                          disabled={isAddingLiquidity || !isConnected}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isAddingLiquidity ? "Adding..." : "Add Liquidity"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )) : (
              <div className="p-4 rounded-lg bg-shiba-dark/50">
                <p className="text-center text-shiba-text-muted">Loading liquidity pools...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Farming Pools */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Farming Pools</h2>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-6 gap-4 text-sm text-shiba-text-muted border-b border-border pb-4 mb-4">
              <div>Pool</div>
              <div>APR</div>
              <div>TVL</div>
              <div>Your Stake</div>
              <div>Rewards</div>
              <div>Actions</div>
            </div>

            {farmingPools.map((pool) => (
              <div key={pool.id} className="grid grid-cols-6 gap-4 text-sm items-center py-4 border-b border-border/50 hover:bg-shiba-card/30 transition-colors">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-1">
                    {pool.tokens.map((token, index) => (
                      <div key={index} className="w-6 h-6 bg-orange-500 rounded-full border-2 border-shiba-dark flex items-center justify-center text-xs">
                        {token}
                      </div>
                    ))}
                  </div>
                  <span>{pool.pair}</span>
                </div>
                <div className="text-shiba-success font-semibold">{pool.apr}</div>
                <div>{pool.tvl}</div>
                <div>{pool.userStake}</div>
                <div>{pool.rewards}</div>
                <div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="shiba-gradient" disabled={!isConnected}>
                        {isConnected ? "Farm" : "Connect Wallet"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Farm {pool.pair}</DialogTitle>
                        <DialogDescription>
                          Provide liquidity to earn trading fees and farm rewards.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Amount (USDC)</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={liquidityAmount}
                            onChange={(e) => setLiquidityAmount(e.target.value)}
                            className="text-white"
                          />
                          <div className="text-sm text-shiba-text-muted mt-1">
                            Balance: {balance.USDC} USDC
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={() => handleAddLiquidity(pool.id)}
                          disabled={isAddingLiquidity || !isConnected}
                          className="shiba-gradient"
                        >
                          {isAddingLiquidity ? "Farming..." : "Start Farming"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}