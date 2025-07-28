import React, { useState, useCallback, createContext, useContext, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface WalletContextType {
  user: { id: string; address: string } | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  balance: {
    BTC: number;
    ETH: number;
    USDT: number;
    SHIBA: number;
  };
  refreshBalance: () => Promise<void>;
  updateBalance: (asset: string, newAmount: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; address: string } | null>({
    id: "_a5rcn0KVzl_FiB1W6uSI",
    address: "demo-user"
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState({
    BTC: 0.1,
    ETH: 2.5, 
    USDT: 10000.0, // Ensure USDT is available for trading
    SHIBA: 1000000.0
  });

  const { toast } = useToast();

  // Safe API call wrapper
  const safeApiCall = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.warn(`API call failed: ${url}`, response.status);
        return null;
      }
    } catch (error) {
      console.warn("Safe API call failed:", error);
      return null;
    }
  };

  // Auto-connect on mount for demo (but don't auto-refresh balance)
  useEffect(() => {
    const connect = async () => {
      if (!user) {
        setUser({
          id: "_a5rcn0KVzl_FiB1W6uSI",
          address: "demo-user"
        });
      }
    };
    connect();
  }, []);

  // Refresh balance from backend (non-blocking)
  const refreshBalance = useCallback(async () => {
    if (!user) return;
    
    const result = await safeApiCall(`/api/users/${user.id}/balance`);
    if (result) {
      // Only update if backend has valid data, otherwise keep local state
      const validBalance = {
        BTC: result.BTC || balance.BTC,
        ETH: result.ETH || balance.ETH,
        USDT: result.USDT || balance.USDT, // Preserve USDT
        SHIBA: result.SHIBA || balance.SHIBA
      };
      setBalance(validBalance);
    }
  }, [user, balance]);

  const updateBalance = useCallback(async (asset: string, newAmount: number) => {
    if (!user) return;

    try {
      // Update local state immediately for better UX
      setBalance(prev => ({
        ...prev,
        [asset]: newAmount
      }));

      // Try to update backend, but don't fail if it doesn't work
      await safeApiCall(`/api/users/${user.id}/balance`, {
        method: "PATCH",
        body: JSON.stringify({ [asset]: newAmount })
      });

    } catch (error) {
      console.warn("Failed to update balance on backend:", error);
      // Balance is already updated locally, so this is fine for demo
    }
  }, [user]);

  const connect = useCallback(async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    try {
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoUser = {
        id: "_a5rcn0KVzl_FiB1W6uSI",
        address: "demo-user"
      };
      
      setUser(demoUser);
      
      toast({
        title: "Wallet Connected",
        description: "Demo wallet connected successfully",
      });

      // Only refresh balance on first connect, not when already connected
      // This prevents balance resets during swaps
      if (!balance.USDT || balance.USDT === 0) {
        setTimeout(() => refreshBalance(), 100);
      }

    } catch (error) {
      console.error("Connection failed:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Using demo mode.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, toast, refreshBalance, balance]);

  const disconnect = useCallback(() => {
    setUser(null);
    setBalance({
      BTC: 0,
      ETH: 0,
      USDT: 0,
      SHIBA: 0
    });
    
    toast({
      title: "Wallet Disconnected",
      description: "Wallet has been disconnected",
    });
  }, [toast]);

  // Auto-connect on mount for demo
  useEffect(() => {
    if (!user && !isConnecting) {
      connect();
    }
  }, [user, isConnecting, connect]);

  // DON'T auto-refresh balance - let user maintain local state
  // The periodic refresh was causing balance resets in swap
  // useEffect(() => {
  //   if (user) {
  //     const interval = setInterval(refreshBalance, 30000);
  //     return () => clearInterval(interval);
  //   }
  // }, [user, refreshBalance]);

  const value: WalletContextType = {
    user,
    isConnected: !!user,
    isConnecting,
    connect,
    disconnect,
    balance,
    refreshBalance,
    updateBalance,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}