import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTrading } from "@/hooks/use-trading";

interface Position {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  size: number;
  entryPrice: number;
  margin: number;
  pnl: number;
  status: string;
}

export default function PositionsTable() {
  const [activeTab, setActiveTab] = useState("positions");

  // Get real trading data
  const { positions, orders, trades, closePosition } = useTrading();

  const handleClosePosition = (positionId: string) => {
    console.log("Closing position:", positionId);
  };

  return (
    <div className="glass-card p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
        </TabsList>

        <TabsContent value="positions">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-shiba-border">
                  <th className="text-left py-3 px-2">Market</th>
                  <th className="text-left py-3 px-2">Side</th>
                  <th className="text-left py-3 px-2">Size</th>
                  <th className="text-left py-3 px-2">Entry Price</th>
                  <th className="text-left py-3 px-2">Margin</th>
                  <th className="text-left py-3 px-2">PnL</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position: any) => (
                  <tr key={position.id} className="border-b border-shiba-border/50">
                    <td className="py-3 px-2 font-medium">{position.symbol}</td>
                    <td className="py-3 px-2">
                      <Badge 
                        variant={position.side === "LONG" ? "default" : "destructive"}
                        className={position.side === "LONG" ? "bg-green-600" : "bg-red-600"}
                      >
                        {position.side}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">${position.size.toFixed(2)}</td>
                    <td className="py-3 px-2">${position.entryPrice.toFixed(2)}</td>
                    <td className="py-3 px-2">${position.margin.toFixed(2)}</td>
                    <td className={`py-3 px-2 ${position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${position.pnl.toFixed(2)}
                    </td>
                    <td className="py-3 px-2">{position.status}</td>
                    <td className="py-3 px-2">
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleClosePosition(position.id)}
                      >
                        Close
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {positions.length === 0 && (
              <div className="text-center py-8 text-shiba-text-muted">
                No open positions
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-shiba-border">
                  <th className="text-left py-3 px-2">Market</th>
                  <th className="text-left py-3 px-2">Side</th>
                  <th className="text-left py-3 px-2">Size</th>
                  <th className="text-left py-3 px-2">Price</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-shiba-border/50">
                    <td className="py-3 px-2 font-medium">{order.symbol}</td>
                    <td className="py-3 px-2">
                      <Badge 
                        variant={order.side === "BUY" ? "default" : "destructive"}
                        className={order.side === "BUY" ? "bg-green-600" : "bg-red-600"}
                      >
                        {order.side}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">${order.size?.toFixed(2) || '0.00'}</td>
                    <td className="py-3 px-2">${order.price?.toFixed(2) || '0.00'}</td>
                    <td className="py-3 px-2">{order.status}</td>
                    <td className="py-3 px-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="text-center py-8 text-shiba-text-muted">
                No orders found
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trades">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-shiba-border">
                  <th className="text-left py-3 px-2">Symbol</th>
                  <th className="text-left py-3 px-2">Side</th>
                  <th className="text-left py-3 px-2">Size</th>
                  <th className="text-left py-3 px-2">Price</th>
                  <th className="text-left py-3 px-2">Fee</th>
                  <th className="text-left py-3 px-2">PnL</th>
                  <th className="text-left py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade: any) => (
                  <tr key={trade.id} className="border-b border-shiba-border/50">
                    <td className="py-3 px-2 font-medium">{trade.symbol}</td>
                    <td className="py-3 px-2">
                      <Badge 
                        variant={trade.side === "BUY" ? "default" : "destructive"}
                        className={trade.side === "BUY" ? "bg-green-600" : "bg-red-600"}
                      >
                        {trade.side}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">${trade.size?.toFixed(2) || '0.00'}</td>
                    <td className="py-3 px-2">${trade.price?.toFixed(2) || '0.00'}</td>
                    <td className="py-3 px-2">${trade.fee?.toFixed(4) || '0.0000'}</td>
                    <td className={`py-3 px-2 ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${trade.pnl?.toFixed(2) || '0.00'}
                    </td>
                    <td className="py-3 px-2">{new Date(trade.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {trades.length === 0 && (
              <div className="text-center py-8 text-shiba-text-muted">
                No trades found
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}