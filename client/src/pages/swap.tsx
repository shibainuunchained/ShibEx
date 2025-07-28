import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTradingData } from "@/hooks/use-trading";
import { useWallet } from "@/hooks/use-wallet";

const availableTokens = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿", color: "text-yellow-500", price: 67235 },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ", color: "text-gray-400", price: 3567 },
  { symbol: "USDC", name: "USD Coin", icon: "💰", color: "text-blue-400", price: 1 },
  { symbol: "SHIBA", name: "ShibaU Token", icon: "🐕", color: "text-orange-500", price: 0.000022 },
];

export default function SwapPage() {
  const [fromToken, setFromToken] = useState(availableTokens[2]); // USDC
  const [toToken, setToToken] = useState(availableTokens[0]); // BTC
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState([0.5]);
  const { toast } = useToast();
  const { user, isConnected, balance } = useWallet();
  const { createOrderMutation } = useTradingData();

  const calculateToAmount = (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) return "";
    const fromValue = parseFloat(amount) * fromToken.price;
    const toTokenAmount = fromValue / toToken.price;
    return toTokenAmount.toLocaleString(undefined, { maximumFractionDigits: 8 });
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount(calculateToAmount(value));
  };

  const handleTokenSwap = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount("");
    setToAmount("");
  };

  const handleSwap = async () => {
    if (!isConnected || !user) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to swap",
      });
      return;
    }

    try {
      toast({
        title: "Swap Successful",
        description: `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
      });
      setFromAmount("");
      setToAmount("");
    } catch (error) {
      toast({
        title: "Swap Failed",
        description: "Failed to execute swap. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Swap</h1>
        <p className="text-shiba-text-secondary">Trade cryptocurrencies instantly</p>
      </div>

      <Card className="glass-card max-w-md mx-auto">
        <CardContent className="p-6 space-y-6">
          {/* From Token */}
          <div>
            <Label className="text-shiba-text-muted mb-2">From</Label>
            <div className="bg-shiba-dark rounded-lg p-4 border border-border">
              <div className="flex justify-between items-center mb-2">
                <Input
                  type="text"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  className="border-0 bg-transparent text-2xl font-semibold p-0 h-auto flex-1"
                />
                <Select value={fromToken.symbol} onValueChange={(value) => {
                  const token = availableTokens.find(t => t.symbol === value);
                  if (token && token.symbol !== toToken.symbol) {
                    setFromToken(token);
                    setFromAmount("");
                    setToAmount("");
                  }
                }}>
                  <SelectTrigger className="w-auto border-0 bg-shiba-card ml-4">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xl ${fromToken.color}`}>{fromToken.icon}</span>
                      <span className="font-medium">{fromToken.symbol}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {availableTokens.filter(token => token.symbol !== toToken.symbol).map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg ${token.color}`}>{token.icon}</span>
                          <div>
                            <div className="font-medium">{token.symbol}</div>
                            <div className="text-sm text-shiba-text-muted">{token.name}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between text-sm text-shiba-text-muted">
                <span>~${fromAmount ? (parseFloat(fromAmount) * fromToken.price).toLocaleString() : "0.00"}</span>
                <span>Balance: {balance[fromToken.symbol as keyof typeof balance]} {fromToken.symbol}</span>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button 
              variant="ghost" 
              className="w-10 h-10 rounded-full hover:bg-shiba-card"
              onClick={handleTokenSwap}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </Button>
          </div>

          {/* To Token */}
          <div>
            <Label className="text-shiba-text-muted mb-2">To</Label>
            <div className="bg-shiba-dark rounded-lg p-4 border border-border">
              <div className="flex justify-between items-center mb-2">
                <Input
                  type="text"
                  placeholder="0.00"
                  value={toAmount}
                  readOnly
                  className="border-0 bg-transparent text-2xl font-semibold p-0 h-auto flex-1"
                />
                <Select value={toToken.symbol} onValueChange={(value) => {
                  const token = availableTokens.find(t => t.symbol === value);
                  if (token && token.symbol !== fromToken.symbol) {
                    setToToken(token);
                    setToAmount(calculateToAmount(fromAmount));
                  }
                }}>
                  <SelectTrigger className="w-auto border-0 bg-shiba-card ml-4">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xl ${toToken.color}`}>{toToken.icon}</span>
                      <span className="font-medium">{toToken.symbol}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {availableTokens.filter(token => token.symbol !== fromToken.symbol).map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg ${token.color}`}>{token.icon}</span>
                          <div>
                            <div className="font-medium">{token.symbol}</div>
                            <div className="text-sm text-shiba-text-muted">{token.name}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between text-sm text-shiba-text-muted">
                <span>~${toAmount ? (parseFloat(toAmount.replace(/,/g, "")) * toToken.price).toLocaleString() : "0.00"}</span>
                <span>Balance: {balance[toToken.symbol as keyof typeof balance]} {toToken.symbol}</span>
              </div>
            </div>
          </div>

          {/* Slippage */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-shiba-text-muted">Slippage Tolerance</Label>
              <div className="bg-shiba-dark px-3 py-1 rounded border border-border min-w-[60px] text-center">
                {slippage[0]}%
              </div>
            </div>
            <Slider
              value={slippage}
              onValueChange={setSlippage}
              max={5}
              min={0.1}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-shiba-text-muted mt-1">
              <span>0.1%</span>
              <span>5%</span>
            </div>
          </div>

          {/* Swap Details */}
          <div className="bg-shiba-dark rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-shiba-text-muted">Exchange Rate</span>
              <span>1 {fromToken.symbol} = {(fromToken.price / toToken.price).toLocaleString(undefined, { maximumFractionDigits: 8 })} {toToken.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-shiba-text-muted">Network Fee</span>
              <span>~$2.50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-shiba-text-muted">Minimum Received</span>
              <span>{toAmount ? (parseFloat(toAmount.replace(/,/g, "")) * (1 - slippage[0] / 100)).toLocaleString(undefined, { maximumFractionDigits: 8 }) : "0"} {toToken.symbol}</span>
            </div>
          </div>

          <Button 
            onClick={handleSwap}
            className="w-full shiba-gradient py-3 font-semibold"
            disabled={!isConnected || !fromAmount || parseFloat(fromAmount) <= 0}
          >
            {!isConnected ? "Connect Wallet" : "Swap"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}