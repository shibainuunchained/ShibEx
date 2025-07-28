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
    BTC: "0.1000",
    ETH: "2.5000", 
    USDC: "10000.00",
    USDT: "10000.00",
    SHIBA: "1000000.00"
  });

  const refreshBalance = useCallback(async () => {
    if (user) {
      try {
        const response = await apiRequest("GET", `/api/users/${user.id}/balance`);
        if (response.ok) {
          const balanceData = await response.json();
          // Format balance values for display
          const formattedBalance = {
            BTC: balanceData.BTC?.toFixed(6) || "0.100000",
            ETH: balanceData.ETH?.toFixed(6) || "2.500000",
            USDC: balanceData.USDC?.toFixed(2) || "10000.00",
            USDT: balanceData.USDT?.toFixed(2) || "10000.00",
            SHIBA: balanceData.SHIBA?.toFixed(2) || "1000000.00"
          };
          setBalance(formattedBalance);
        } else {
          // If API fails, get balance from user object
          if (user.balance) {
            const formattedBalance = {
              BTC: user.balance.BTC?.toFixed(6) || "0.100000",
              ETH: user.balance.ETH?.toFixed(6) || "2.500000",
              USDC: user.balance.USDC?.toFixed(2) || "10000.00",
              USDT: user.balance.USDT?.toFixed(2) || "10000.00",
              SHIBA: user.balance.SHIBA?.toFixed(2) || "1000000.00"
            };
            setBalance(formattedBalance);
          }
        }
      } catch (error) {
        console.error('Failed to refresh balance:', error);
        // Keep current balance if API fails, or use user object balance
        if (user.balance) {
          const formattedBalance = {
            BTC: user.balance.BTC?.toFixed(6) || "0.100000",
            ETH: user.balance.ETH?.toFixed(6) || "2.500000",
            USDC: user.balance.USDC?.toFixed(2) || "10000.00", 
            USDT: user.balance.USDT?.toFixed(2) || "10000.00",
            SHIBA: user.balance.SHIBA?.toFixed(2) || "1000000.00"
          };
          setBalance(formattedBalance);
        }
      }
    }
  }, [user]);

  const updateBalance = useCallback((asset: string, amount: number, operation: 'add' | 'subtract') => {
    setBalance(prev => {
      const currentAmount = parseFloat(prev[asset as keyof typeof prev]?.replace(/,/g, '') || '0');
      const newAmount = operation === 'add' ? currentAmount + amount : currentAmount - amount;
      
      // Format based on asset type
      const formatted = asset === 'BTC' || asset === 'ETH' ? 
        newAmount.toFixed(6) : 
        newAmount.toFixed(2);
      
      return {
        ...prev,
        [asset]: formatted
      };
    });

    // Update user object as well
    if (user && user.balance) {
      const currentAmount = user.balance[asset] || 0;
      const newAmount = operation === 'add' ? currentAmount + amount : currentAmount - amount;
      const updatedUser = {
        ...user,
        balance: {
          ...user.balance,
          [asset]: newAmount
        }
      };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  }, [user]);

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
    setBalance({
      BTC: "0.100000",
      ETH: "2.500000",
      USDC: "10000.00",
      USDT: "10000.00", 
      SHIBA: "1000000.00"
    });
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