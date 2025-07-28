import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function BuyPage() {
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const { toast } = useToast();

  const exchangeRate = 45234; // 1 USD = 45,234 SHIBA
  const processingFee = 2.5; // 2.5%
  const networkFee = 2.50; // $2.50

  const handleAmountChange = (value: string) => {
    setPayAmount(value);
    if (value) {
      const shibaAmount = parseFloat(value) * exchangeRate;
      setReceiveAmount(shibaAmount.toLocaleString());
    } else {
      setReceiveAmount("");
    }
  };

  const handlePurchase = async () => {
    if (!payAmount || parseFloat(payAmount) < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum purchase amount is $10",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Purchase Initiated",
      description: "Redirecting to secure payment processor...",
    });
  };

  const totalCost = payAmount ? parseFloat(payAmount) * (1 + processingFee / 100) + networkFee : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Buy SHIBA</h1>
        <p className="text-shiba-text-secondary">Purchase SHIBA tokens with credit card or crypto</p>
      </div>

      <Card className="glass-card max-w-md mx-auto">
        <CardContent className="p-8">
          <Tabs defaultValue="buy" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="sell">Sell</TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="space-y-4 mt-6">
              {/* Pay Amount */}
              <div>
                <Label className="text-shiba-text-muted">Pay</Label>
                <div className="bg-shiba-dark rounded-lg p-4 border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={payAmount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="border-0 bg-transparent text-2xl font-semibold p-0 h-auto"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400">💵</span>
                      <span className="font-medium">USD</span>
                      <svg className="w-4 h-4 text-shiba-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-sm text-shiba-text-muted">Min: $10, Max: $10,000</div>
                </div>
              </div>

              {/* Exchange Icon */}
              <div className="flex justify-center">
                <Button variant="ghost" className="w-10 h-10 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </Button>
              </div>

              {/* Receive Amount */}
              <div>
                <Label className="text-shiba-text-muted">Receive</Label>
                <div className="bg-shiba-dark rounded-lg p-4 border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <Input
                      type="text"
                      placeholder="0.00"
                      value={receiveAmount}
                      readOnly
                      className="border-0 bg-transparent text-2xl font-semibold p-0 h-auto"
                    />
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 shiba-gradient rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🐕</span>
                      </div>
                      <span className="font-medium">SHIBA</span>
                    </div>
                  </div>
                  <div className="text-sm text-shiba-text-muted">
                    Rate: 1 USD = {exchangeRate.toLocaleString()} SHIBA
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="bg-shiba-dark rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-shiba-text-muted">Processing Fee</span>
                  <span>{processingFee}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-shiba-text-muted">Network Fee</span>
                  <span>~${networkFee}</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${totalCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Purchase Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handlePurchase}
                  className="w-full shiba-gradient py-3 font-semibold"
                >
                  Continue with Credit Card
                </Button>
                <Button variant="outline" className="w-full py-3 font-semibold">
                  Pay with Crypto
                </Button>
              </div>

              {/* Disclaimer */}
              <div className="text-center text-xs text-shiba-text-muted">
                Powered by secure payment processing<br />
                KYC verification may be required
              </div>
            </TabsContent>

            <TabsContent value="sell" className="text-center py-8">
              <p className="text-shiba-text-muted">Sell functionality coming soon</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
