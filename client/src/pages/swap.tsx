import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { useWebSocket } from "@/hooks/use-websocket";

const availableTokens = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿", color: "text-yellow-500", decimals: 8 },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ", color: "text-gray-400", decimals: 6 },
  { symbol: "USDT", name: "Tether USD", icon: "💰", color: "text-green-400", decimals: 2 },
  { symbol: "SHIBA", name: "ShibaU Token", icon: "🐕", color: "text-orange-500", decimals: 8 },
];

export default function SwapPage() {
  const [fromToken, setFromToken] = useState(availableTokens[2]); // USDT
  const [toToken, setToToken] = useState(availableTokens[0]); // BTC
  const [fromAmount, setFromAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const { toast } = useToast();
  const { balance, updateBalance } = useWallet();
  const { marketData } = useWebSocket();

  // Get current prices from market data
  const getTokenPrice = (symbol: string) => {
    if (symbol === "USDT") return 1;
    
    const marketSymbol = `${symbol}/USD`;
    const data = marketData.find(d => d.symbol === marketSymbol);
    return data ? parseFloat(data.price) : 1;
  };

  const fromPrice = getTokenPrice(fromToken.symbol);
  const toPrice = getTokenPrice(toToken.symbol);

  const calculateToAmount = (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) return "";
    
    try {
      const fromValue = parseFloat(amount) * fromPrice;
      const toTokenAmount = fromValue / toPrice;
      return toTokenAmount.toFixed(toToken.decimals);
    } catch (error) {
      return "";
    }
  };

  const toAmount = calculateToAmount(fromAmount);
  const exchangeRate = fromPrice / toPrice;

  const handleFromAmountChange = (value: string) => {
    // Only allow valid numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
    }
  };

  const handleTokenSwap = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount("");
  };

  const setMaxAmount = () => {
    const available = balance[fromToken.symbol as keyof typeof balance] || 0;
    setFromAmount(available.toString());
  };

  const handleSwap = async () => {
    if (isSwapping) return;

    try {
      setIsSwapping(true);

      // Validation
      const fromAmountNum = parseFloat(fromAmount);
      const toAmountNum = parseFloat(toAmount);
      const available = balance[fromToken.symbol as keyof typeof balance] || 0;

      if (!fromAmount || fromAmountNum <= 0) {
        throw new Error("Please enter a valid amount");
      }

      if (fromAmountNum > available) {
        throw new Error(`Insufficient ${fromToken.symbol} balance`);
      }

      if (!toAmount || toAmountNum <= 0) {
        throw new Error("Invalid swap calculation");
      }

      // Show loading toast
      toast({
        title: "Processing Swap...",
        description: `Swapping ${fromAmountNum} ${fromToken.symbol} for ${toAmountNum} ${toToken.symbol}`,
      });

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update balances locally (simulate successful swap)
      const newFromBalance = available - fromAmountNum;
      const currentToBalance = balance[toToken.symbol as keyof typeof balance] || 0;
      const newToBalance = currentToBalance + toAmountNum;

      // Update wallet balances
      await updateBalance(fromToken.symbol, newFromBalance);
      await updateBalance(toToken.symbol, newToBalance);

      // Success
      toast({
        title: "Swap Successful!",
        description: `Successfully swapped ${fromAmountNum} ${fromToken.symbol} for ${toAmountNum} ${toToken.symbol}`,
      });

      // Reset form
      setFromAmount("");

    } catch (error: any) {
      console.error("Swap error:", error);
      
      toast({
        title: "Swap Failed",
        description: error.message || "An error occurred during the swap",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const fromAmountNum = parseFloat(fromAmount) || 0;
  const available = balance[fromToken.symbol as keyof typeof balance] || 0;
  const isValidAmount = fromAmountNum > 0 && fromAmountNum <= available;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card className="bg-shiba-darker border-shiba-border">
        <CardHeader>
          <CardTitle className="text-white text-center">Token Swap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* From Token */}
          <div className="space-y-2">
            <Label className="text-white">From</Label>
            <div className="flex gap-2">
              <Select value={fromToken.symbol} onValueChange={(value) => {
                const token = availableTokens.find(t => t.symbol === value);
                if (token) setFromToken(token);
              }}>
                <SelectTrigger className="w-32 bg-shiba-darker border-shiba-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center space-x-2">
                        <span>{token.icon}</span>
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  className="bg-shiba-darker border-shiba-border text-white text-right pr-16"
                  disabled={isSwapping}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={setMaxAmount}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                  disabled={isSwapping}
                >
                  MAX
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Balance: {available.toFixed(fromToken.decimals)} {fromToken.symbol}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleTokenSwap}
              className="rounded-full p-2 hover:bg-gray-700"
              disabled={isSwapping}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <Label className="text-white">To</Label>
            <div className="flex gap-2">
              <Select value={toToken.symbol} onValueChange={(value) => {
                const token = availableTokens.find(t => t.symbol === value);
                if (token) setToToken(token);
              }}>
                <SelectTrigger className="w-32 bg-shiba-darker border-shiba-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center space-x-2">
                        <span>{token.icon}</span>
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder="0.0"
                value={toAmount}
                readOnly
                className="flex-1 bg-gray-800 border-gray-700 text-white text-right cursor-not-allowed"
              />
            </div>
            <div className="text-sm text-gray-400">
              Balance: {(balance[toToken.symbol as keyof typeof balance] || 0).toFixed(toToken.decimals)} {toToken.symbol}
            </div>
          </div>

          {/* Exchange Rate */}
          {fromAmount && toAmount && (
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-300">
                1 {fromToken.symbol} = {exchangeRate.toFixed(6)} {toToken.symbol}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                ${fromPrice.toFixed(2)} → ${toPrice.toFixed(2)}
              </div>
            </div>
          )}

          {/* Swap Button */}
          <Button
            onClick={handleSwap}
            disabled={!isValidAmount || isSwapping || fromToken.symbol === toToken.symbol}
            className="w-full"
          >
            {isSwapping ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                <span>Swapping...</span>
              </div>
            ) : fromToken.symbol === toToken.symbol ? (
              "Select different tokens"
            ) : !fromAmount ? (
              "Enter amount"
            ) : !isValidAmount ? (
              "Insufficient balance"
            ) : (
              `Swap ${fromToken.symbol} for ${toToken.symbol}`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}