import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Position, Order, Trade, MarketData } from "@shared/schema";

export function useTradingData() {
  const queryClient = useQueryClient();

  // Market data query
  const { data: marketData = [], isLoading: isLoadingMarketData } = useQuery({
    queryKey: ["/api/market-data"],
  });

  // Positions query
  const usePositions = (userId: string = "demo-user") => {
    return useQuery({
      queryKey: ["/api/positions", userId],
      enabled: !!userId,
    });
  };

  // Orders query
  const useOrders = (userId: string = "demo-user") => {
    return useQuery({
      queryKey: ["/api/orders", userId],
      enabled: !!userId,
    });
  };

  // Trades query
  const useTrades = (userId: string = "demo-user") => {
    return useQuery({
      queryKey: ["/api/trades", userId],
      enabled: !!userId,
    });
  };

  // Create position mutation
  const createPositionMutation = useMutation({
    mutationFn: async (positionData: {
      userId: string;
      market: string;
      side: "LONG" | "SHORT";
      size: string;
      collateral: string;
      entryPrice: string;
      leverage: string;
    }) => {
      const response = await apiRequest("POST", "/api/positions", positionData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/positions", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/trades", variables.userId] });
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      userId: string;
      market: string;
      type: "MARKET" | "LIMIT" | "STOP_LOSS" | "TAKE_PROFIT";
      side: "LONG" | "SHORT";
      size: string;
      price?: string;
      triggerPrice?: string;
    }) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", variables.userId] });
    },
  });

  // Close position mutation
  const closePositionMutation = useMutation({
    mutationFn: async ({ positionId, userId }: { positionId: string; userId: string }) => {
      const response = await apiRequest("POST", `/api/positions/${positionId}/close`);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/positions", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/trades", variables.userId] });
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async ({ orderId, userId }: { orderId: string; userId: string }) => {
      const response = await apiRequest("DELETE", `/api/orders/${orderId}`);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", variables.userId] });
    },
  });

  // Helper functions for calculations
  const calculateLiquidationPrice = (
    entryPrice: number,
    leverage: number,
    side: "LONG" | "SHORT"
  ) => {
    if (side === "LONG") {
      return entryPrice * (1 - 1 / leverage * 0.9);
    } else {
      return entryPrice * (1 + 1 / leverage * 0.9);
    }
  };

  const calculatePnL = (
    entryPrice: number,
    currentPrice: number,
    size: number,
    side: "LONG" | "SHORT"
  ) => {
    if (side === "LONG") {
      return ((currentPrice - entryPrice) / entryPrice) * size;
    } else {
      return ((entryPrice - currentPrice) / entryPrice) * size;
    }
  };

  const calculateFees = (size: number, feeRate: number = 0.001) => {
    return size * feeRate;
  };

  // Exchange rates for swap functionality
  const exchangeRates = {
    "BTC/SHIBA": 1456789,
    "ETH/SHIBA": 4690,
    "USDC/SHIBA": 45234,
    "BTC/USD": 67235,
    "ETH/USD": 3567,
    "USDC/USD": 1,
  };

  const getExchangeRate = (fromSymbol: string, toSymbol: string) => {
    const pair = `${fromSymbol}/${toSymbol}`;
    return exchangeRates[pair as keyof typeof exchangeRates] || 1;
  };

  return {
    marketData,
    isLoadingMarketData,
    usePositions,
    useOrders,
    useTrades,
    createPosition: createPositionMutation || { isPending: false, mutateAsync: async () => {} },
    createOrder: createOrderMutation || { isPending: false, mutateAsync: async () => {} },
    closePosition: closePositionMutation || { isPending: false, mutateAsync: async () => {} },
    cancelOrder: cancelOrderMutation || { isPending: false, mutateAsync: async () => {} },
    calculateLiquidationPrice,
    calculatePnL,
    calculateFees,
    exchangeRates,
    getExchangeRate,
  };
}

// Hook for portfolio calculations
export function usePortfolio(userId: string) {
  const { usePositions, useTrades } = useTradingData();
  const { data: positions = [] } = usePositions(userId);
  const { data: trades = [] } = useTrades(userId);

  const positionsArray = positions as Position[];
  const tradesArray = trades as Trade[];

  const totalPortfolioValue = positionsArray.reduce((total: number, position: Position) => {
    const netValue = parseFloat(position.pnl || "0") + parseFloat(position.collateral);
    return total + netValue;
  }, 0);

  const totalPnL = positionsArray.reduce((total: number, position: Position) => {
    return total + parseFloat(position.pnl || "0");
  }, 0);

  const totalVolume = tradesArray.reduce((total: number, trade: Trade) => {
    return total + parseFloat(trade.size) * parseFloat(trade.price);
  }, 0);

  const winRate = tradesArray.length > 0 ? 
    tradesArray.filter((trade: Trade) => parseFloat(trade.pnl || "0") > 0).length / tradesArray.length * 100 : 
    0;

  return {
    totalPortfolioValue,
    totalPnL,
    totalVolume,
    winRate,
    positions,
    trades,
  };
}
