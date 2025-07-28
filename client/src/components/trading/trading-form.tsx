import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTradingData } from "@/hooks/use-trading";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

interface TradingFormProps {
  symbol: string;
  price: number;
}

const orderTypes = [
  { id: "LONG", label: "Long", description: "Buy and profit from price increases" },
  { id: "SHORT", label: "Short", description: "Sell and profit from price decreases" }
];

const leverageOptions = [
  { value: 1, label: "1x" },
  { value: 2, label: "2x" },
  { value: 5, label: "5x" },
  { value: 10, label: "10x" },
  { value: 20, label: "20x" },
  { value: 50, label: "50x" },
  { value: 100, label: "100x" }
];

const quickAmounts = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 }
];

export default function TradingForm({ symbol, price }: TradingFormProps) {
  const [orderType, setOrderType] = useState<"LONG" | "SHORT">("LONG");
  const [size, setSize] = useState("");
  const [leverage, setLeverage] = useState([2]);
  const [orderMode, setOrderMode] = useState<"MARKET" | "LIMIT">("MARKET");
  const [limitPrice, setLimitPrice] = useState("");

  const { createPosition } = useTradingData();
  const { balance, refreshBalance } = useWallet();
  const { toast } = useToast();

  const currentLeverage = leverage[0];
  const sizeNum = parseFloat(size) || 0;
  const requiredMargin = sizeNum * price / currentLeverage;
  const usdtBalance = parseFloat(balance?.USDT?.replace(/,/g, '') || '0') || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!size || sizeNum <= 0) {
      toast({
        title: "Invalid Size",
        description: "Please enter a valid position size",
        variant: "destructive"
      });
      return;
    }

    if (requiredMargin > usdtBalance) {
      toast({
        title: "Insufficient Balance",
        description: `Required margin: $${requiredMargin.toFixed(2)}, Available: $${usdtBalance.toFixed(2)}`,
        variant: "destructive"
      });
      return;
    }

    try {
      await createPosition.mutateAsync({
        userId: "demo-user",
        market: symbol,
        side: orderType,
        size: sizeNum.toString(),
        collateral: requiredMargin.toString(),
        entryPrice: (orderMode === "LIMIT" ? parseFloat(limitPrice) || price : price).toString(),
        leverage: currentLeverage.toString(),
      });

      // Refresh balance after successful trade
      await refreshBalance();

      toast({
        title: "Position Opened",
        description: `${orderType} position opened for ${symbol}`,
      });

      // Reset form
      setSize("");
      setLimitPrice("");
    } catch (error: any) {
      toast({
        title: "Trade Failed",
        description: error.message || "Failed to open position",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Trade {symbol}</span>
          <Badge variant="outline" className="text-shiba-primary">
            {currentLeverage}x Leverage
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Type */}
          <div className="space-y-3">
            <Label>Position Type</Label>
            <RadioGroup 
              value={orderType} 
              onValueChange={(value) => setOrderType(value as "LONG" | "SHORT")}
              className="grid grid-cols-2 gap-4"
            >
              {orderTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.id} id={type.id} />
                  <Label htmlFor={type.id} className="cursor-pointer">
                    <div className={`p-3 rounded-lg border transition-colors ${
                      orderType === type.id 
                        ? type.id === "LONG" 
                          ? "border-green-500 bg-green-500/10" 
                          : "border-red-500 bg-red-500/10"
                        : "border-shiba-border"
                    }`}>
                      <div className={`font-semibold ${
                        type.id === "LONG" ? "text-green-500" : "text-red-500"
                      }`}>
                        {type.label}
                      </div>
                      <div className="text-xs text-shiba-text-muted">
                        {type.description}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Order Mode */}
          <div className="space-y-3">
            <Label>Order Type</Label>
            <Select value={orderMode} onValueChange={(value: "MARKET" | "LIMIT") => setOrderMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MARKET">Market Order</SelectItem>
                <SelectItem value="LIMIT">Limit Order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Limit Price */}
          {orderMode === "LIMIT" && (
            <div className="space-y-2">
              <Label htmlFor="limitPrice">Limit Price ($)</Label>
              <Input
                id="limitPrice"
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder={`Current: $${price.toFixed(2)}`}
                className="bg-shiba-darker border-shiba-border text-white placeholder:text-gray-400"
              />
            </div>
          )}

          {/* Position Size */}
          <div className="space-y-2">
            <Label htmlFor="size">Position Size (USD)</Label>
            <Input
              id="size"
              type="number"
              step="0.01"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="Enter position size..."
              className="bg-shiba-darker border-shiba-border text-white placeholder:text-gray-400"
            />
            <div className="text-sm text-shiba-text-muted">
              Required margin: ${requiredMargin.toFixed(2)} | Available: ${usdtBalance.toFixed(2)}
            </div>
          </div>

          {/* Leverage */}
          <div className="space-y-3">
            <Label>Leverage: {currentLeverage}x</Label>
            <Slider
              value={leverage}
              onValueChange={setLeverage}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex flex-wrap gap-2">
              {leverageOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={currentLeverage === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLeverage([option.value])}
                  className="h-8 px-3 text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className={`w-full ${
              orderType === "LONG" 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-red-600 hover:bg-red-700"
            }`}
            disabled={createPosition?.isPending || false}
          >
            {createPosition?.isPending 
              ? "Opening Position..." 
              : `${orderType} ${symbol}`
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}