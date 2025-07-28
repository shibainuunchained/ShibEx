import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Position {
  id: string;
  userId: string;
  market: string;
  type: string;
  size: string;
  entryPrice: string;
  leverage: string;
  collateral: string;
  createdAt: string;
}

interface Trade {
  id: string;
  userId: string;
  positionId: string;
  type: string;
  size: string;
  price: string;
  createdAt: string;
}

interface Order {
  id: string;
  userId: string;
  market: string;
  type: string;
  side: string;
  size: string;
  price: string;
  status: string;
  createdAt: string;
}

interface CreatePositionData {
  userId: string;
  market: string;
  type: string;
  size: string;
  entryPrice: string;
  leverage: string;
  collateral: string;
}

// Bulletproof API wrapper with error handling
const safeApiCall = async (url: string, options: RequestInit = {}) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Use status text if JSON parsing fails
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

export function useTrading() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get positions
  const positions = useQuery<Position[]>({
    queryKey: ["positions", "demo-user"],
    queryFn: () => safeApiCall("/api/positions/demo-user"),
    retry: 3,
    retryDelay: 1000,
    staleTime: 5000,
  });

  // Get trades  
  const trades = useQuery<Trade[]>({
    queryKey: ["trades", "demo-user"],
    queryFn: () => safeApiCall("/api/trades/demo-user"),
    retry: 3,
    retryDelay: 1000,
    staleTime: 5000,
  });

  // Get orders
  const orders = useQuery<Order[]>({
    queryKey: ["orders", "demo-user"],
    queryFn: () => safeApiCall("/api/orders/demo-user"),
    retry: 3,
    retryDelay: 1000,
    staleTime: 5000,
  });

  // Create position mutation
  const createPosition = useMutation({
    mutationFn: async (data: CreatePositionData) => {
      return safeApiCall("/api/positions", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      
      console.log("Position created successfully:", data);
    },
    onError: (error: any) => {
      console.error("Failed to create position:", error);
      
      // Don't show toast here, let the component handle it
      // This prevents double error messages
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Close position mutation
  const closePosition = useMutation({
    mutationFn: async (positionId: string) => {
      return safeApiCall(`/api/positions/${positionId}/close`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      
      toast({
        title: "Position Closed",
        description: "Position has been closed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Close Position",
        description: error.message || "An error occurred while closing the position",
        variant: "destructive",
      });
    },
  });

  // Create order mutation
  const createOrder = useMutation({
    mutationFn: async (orderData: any) => {
      return safeApiCall("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      
      toast({
        title: "Order Created",
        description: "Your order has been placed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Order",
        description: error.message || "An error occurred while creating the order",
        variant: "destructive",
      });
    },
  });

  // Cancel order mutation
  const cancelOrder = useMutation({
    mutationFn: async (orderId: string) => {
      return safeApiCall(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      
      toast({
        title: "Order Cancelled",
        description: "Order has been cancelled successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Cancel Order",
        description: error.message || "An error occurred while cancelling the order",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    positions: positions.data || [],
    trades: trades.data || [],
    orders: orders.data || [],
    
    // Loading states
    isLoadingPositions: positions.isLoading,
    isLoadingTrades: trades.isLoading,
    isLoadingOrders: orders.isLoading,
    
    // Error states  
    positionsError: positions.error,
    tradesError: trades.error,
    ordersError: orders.error,
    
    // Mutations
    createPosition,
    closePosition,
    createOrder,
    cancelOrder,
    
    // Refetch functions
    refetchPositions: positions.refetch,
    refetchTrades: trades.refetch,
    refetchOrders: orders.refetch,
  };
}
