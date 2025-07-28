import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTrading } from "@/hooks/use-trading";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

interface TradingFormProps {
  selectedPair: string;
  currentPrice: number;
}

export function TradingForm({ selectedPair, currentPrice }: TradingFormProps) {
  const [orderType, setOrderType] = useState("market");
  const [position, setPosition] = useState("long");
  const [size, setSize] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [leverage, setLeverage] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createPosition } = useTrading();
  const { balance } = useWallet();
  const { toast } = useToast();

  // Auto-populate limit price when switching to limit order
  useEffect(() => {
    if (orderType === "limit" && !limitPrice) {
      setLimitPrice(currentPrice.toString());
    }
  }, [orderType, currentPrice, limitPrice]);

  // Calculate position details
  const positionSize = parseFloat(size) || 0;
  const entryPrice = orderType === "market" ? currentPrice : (parseFloat(limitPrice) || currentPrice);
  const leverageMultiplier = parseFloat(leverage) || 1;
  const collateral = positionSize / leverageMultiplier;
  const margin = collateral;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Validation
      if (!size || positionSize <= 0) {
        throw new Error("Please enter a valid position size");
      }

      if (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0)) {
        throw new Error("Please enter a valid limit price");
      }

      if (collateral > balance.USDT) {
        throw new Error(`Insufficient balance. Required: $${collateral.toFixed(2)}, Available: $${balance.USDT.toFixed(2)}`);
      }

      // Show loading toast
      toast({
        title: "Creating Position...",
        description: "Please wait while we process your trade",
      });

      // Prepare position data
      const positionData = {
        userId: "demo-user", // In real app, get from auth
        market: selectedPair,
        side: position, // Changed from 'type' to 'side' to match schema
        size: positionSize.toString(),
        entryPrice: entryPrice.toString(),
        leverage: leverageMultiplier.toString(),
        collateral: collateral.toString(),
      };

      console.log("Submitting position:", positionData);

      // Submit with timeout protection
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 10000)
      );

      const createPromise = createPosition.mutateAsync(positionData);

      await Promise.race([createPromise, timeoutPromise]);

      // Success
      toast({
        title: "Position Created Successfully!",
        description: `${position.toUpperCase()} position for ${positionSize} ${selectedPair.split('/')[0]} created`,
      });

      // Reset form
      setSize("");
      setLimitPrice("");
      setLeverage("1");

    } catch (error: any) {
      console.error("Trading error:", error);
      
      // User-friendly error messages
      let errorMessage = error.message || "Failed to create position";
      
      if (error.message?.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message?.includes("balance")) {
        errorMessage = error.message; // Keep balance error as-is
      }

      toast({
        title: "Trade Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-shiba-darker border-shiba-border">
      <CardHeader>
        <CardTitle className="text-white">Trade {selectedPair}</CardTitle>
        <CardDescription className="text-gray-400">
          Current Price: ${currentPrice.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order Type */}
          <div className="space-y-2">
            <Label className="text-white">Order Type</Label>
            <Select value={orderType} onValueChange={setOrderType}>
              <SelectTrigger className="bg-shiba-darker border-shiba-border text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market Order</SelectItem>
                <SelectItem value="limit">Limit Order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Position Type */}
          <div className="space-y-2">
            <Label className="text-white">Position</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={position === "long" ? "default" : "outline"}
                onClick={() => setPosition("long")}
                className={position === "long" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                Long
              </Button>
              <Button
                type="button"
                variant={position === "short" ? "default" : "outline"}
                onClick={() => setPosition("short")}
                className={position === "short" ? "bg-red-600 hover:bg-red-700" : ""}
              >
                Short
              </Button>
            </div>
          </div>

          {/* Position Size */}
          <div className="space-y-2">
            <Label className="text-white">Position Size (USD)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="Enter position size"
              className="bg-shiba-darker border-shiba-border text-white placeholder:text-gray-400"
              disabled={isSubmitting}
            />
          </div>

          {/* Limit Price (only for limit orders) */}
          {orderType === "limit" && (
            <div className="space-y-2">
              <Label className="text-white">Limit Price</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder="Enter limit price"
                className="bg-shiba-darker border-shiba-border text-white placeholder:text-gray-400"
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Leverage */}
          <div className="space-y-2">
            <Label className="text-white">Leverage</Label>
            <Select value={leverage} onValueChange={setLeverage}>
              <SelectTrigger className="bg-shiba-darker border-shiba-border text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="5">5x</SelectItem>
                <SelectItem value="10">10x</SelectItem>
                <SelectItem value="20">20x</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Position Summary */}
          {positionSize > 0 && (
            <div className="p-3 bg-gray-800 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Entry Price:</span>
                <span>${entryPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Collateral Required:</span>
                <span>${collateral.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Available Balance:</span>
                <span>${balance.USDT.toFixed(2)} USDT</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !size || positionSize <= 0 || collateral > balance.USDT}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Position...</span>
              </div>
            ) : (
              `Open ${position.charAt(0).toUpperCase() + position.slice(1)} Position`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}