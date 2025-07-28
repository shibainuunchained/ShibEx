import React, { useState, useCallback, createContext, useContext, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface WalletContextType {
  user: User | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  balance: {
    BTC: string;
    ETH: string;
    USDC: string;
    USDT: string;
    SHIBA: string;
  };
  refreshBalance: () => Promise<void>;
  updateBalance: (asset: string, amount: number, operation: 'add' | 'subtract') => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState({
    BTC: "0.0234",
    ETH: "1.567", 
    USDC: "10,234.56",
    USDT: "8,456.78",
    SHIBA: "1,234,567"
  });

  const refreshBalance = useCallback(async () => {
    if (user) {
      try {
        const response = await apiRequest("GET", `/api/users/${user.id}/balance`);
        if (response.ok) {
          const balanceData = await response.json();
          setBalance(balanceData);
        }
      } catch (error) {
        console.error('Failed to refresh balance:', error);
        // Keep current balance if API fails
      }
    }
  }, [user]);

  const updateBalance = useCallback((asset: string, amount: number, operation: 'add' | 'subtract') => {
    setBalance(prev => {
      const currentAmount = parseFloat(prev[asset as keyof typeof prev]?.replace(/,/g, '') || '0');
      const newAmount = operation === 'add' ? currentAmount + amount : currentAmount - amount;
      return {
        ...prev,
        [asset]: newAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })
      };
    });
  }, []);

  // Refresh balance when user connects
  useEffect(() => {
    if (user) {
      refreshBalance();
    }
  }, [user, refreshBalance]);
  const { toast } = useToast();

  const generateDemoAddress = () => {
    return "0x" + Math.random().toString(16).substring(2, 42).padStart(40, '0');
  };

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const demoAddress = generateDemoAddress();

      // Create or get user
      try {
        const response = await apiRequest("POST", "/api/users", {
          address: demoAddress,
          referralCode: null,
          referredBy: null
        });

        const userData = await response.json();
        setUser(userData);

        // Store in localStorage for persistence
        localStorage.setItem('walletAddress', demoAddress);
        localStorage.setItem('userData', JSON.stringify(userData));

        toast({
          title: "Wallet Connected",
          description: `Connected to ${demoAddress.slice(0, 6)}...${demoAddress.slice(-4)}`,
        });
      } catch (error) {
        // If user already exists, try to get existing user
        try {
          const existingResponse = await apiRequest("GET", `/api/users/${demoAddress}`);
          const userData = await existingResponse.json();
          setUser(userData);
          localStorage.setItem('walletAddress', demoAddress);
          localStorage.setItem('userData', JSON.stringify(userData));
        } catch (getError) {
          throw error;
        }
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const disconnect = useCallback(() => {
    setUser(null);
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('userData');
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  }, [toast]);

  // Auto-connect on app load if previously connected
  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    const storedUserData = localStorage.getItem('userData');

    if (storedAddress && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  const value: WalletContextType = {
    user,
    isConnected: !!user,
    isConnecting,
    connect,
    disconnect,
    balance,
    refreshBalance,
    updateBalance
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