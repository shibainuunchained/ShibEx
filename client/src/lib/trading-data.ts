import type { MarketData, Position, Order, Trade } from "@shared/schema";

// Market data utilities
export const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice);
};

export const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

export const formatPercentage = (percentage: string | number): string => {
  const numPercentage = typeof percentage === "string" ? parseFloat(percentage) : percentage;
  return `${numPercentage >= 0 ? "+" : ""}${numPercentage.toFixed(2)}%`;
};

export const formatVolume = (volume: string | number): string => {
  const numVolume = typeof volume === "string" ? parseFloat(volume) : volume;
  
  if (numVolume >= 1_000_000) {
    return `$${(numVolume / 1_000_000).toFixed(1)}M`;
  } else if (numVolume >= 1_000) {
    return `$${(numVolume / 1_000).toFixed(1)}K`;
  } else {
    return `$${numVolume.toFixed(0)}`;
  }
};

// Trading calculations
export const calculateLeverage = (collateral: number, positionSize: number): number => {
  if (collateral === 0) return 0;
  return positionSize / collateral;
};

export const calculateMargin = (positionSize: number, leverage: number): number => {
  if (leverage === 0) return positionSize;
  return positionSize / leverage;
};

export const calculateLiquidationPrice = (
  entryPrice: number,
  leverage: number,
  side: "LONG" | "SHORT",
  maintenanceMargin: number = 0.5
): number => {
  const liquidationPercentage = (100 - maintenanceMargin) / leverage / 100;
  
  if (side === "LONG") {
    return entryPrice * (1 - liquidationPercentage);
  } else {
    return entryPrice * (1 + liquidationPercentage);
  }
};

export const calculatePnL = (
  entryPrice: number,
  currentPrice: number,
  positionSize: number,
  side: "LONG" | "SHORT"
): number => {
  const priceDifference = side === "LONG" 
    ? currentPrice - entryPrice 
    : entryPrice - currentPrice;
  
  return (priceDifference / entryPrice) * positionSize;
};

export const calculatePnLPercentage = (
  entryPrice: number,
  currentPrice: number,
  side: "LONG" | "SHORT"
): number => {
  if (side === "LONG") {
    return ((currentPrice - entryPrice) / entryPrice) * 100;
  } else {
    return ((entryPrice - currentPrice) / entryPrice) * 100;
  }
};

// Risk calculations
export const calculateRiskReward = (
  entryPrice: number,
  takeProfitPrice: number,
  stopLossPrice: number,
  side: "LONG" | "SHORT"
): number => {
  let profit: number, loss: number;
  
  if (side === "LONG") {
    profit = takeProfitPrice - entryPrice;
    loss = entryPrice - stopLossPrice;
  } else {
    profit = entryPrice - takeProfitPrice;
    loss = stopLossPrice - entryPrice;
  }
  
  return loss !== 0 ? profit / loss : 0;
};

export const calculatePositionSize = (
  accountBalance: number,
  riskPercentage: number,
  entryPrice: number,
  stopLossPrice: number,
  side: "LONG" | "SHORT"
): number => {
  const riskAmount = accountBalance * (riskPercentage / 100);
  const priceRisk = side === "LONG" 
    ? entryPrice - stopLossPrice 
    : stopLossPrice - entryPrice;
  
  if (priceRisk <= 0) return 0;
  
  return riskAmount / (priceRisk / entryPrice);
};

// Fee calculations
export const calculateTradingFees = (
  positionSize: number,
  feeRate: number = 0.001
): number => {
  return positionSize * feeRate;
};

export const calculateFundingFee = (
  positionSize: number,
  fundingRate: number,
  hours: number = 1
): number => {
  return positionSize * (fundingRate / 100) * (hours / 8);
};

// Market analysis utilities
export const calculateVolatility = (prices: number[], periods: number = 20): number => {
  if (prices.length < periods) return 0;
  
  const recentPrices = prices.slice(-periods);
  const returns = [];
  
  for (let i = 1; i < recentPrices.length; i++) {
    const return_ = Math.log(recentPrices[i] / recentPrices[i - 1]);
    returns.push(return_);
  }
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance * 252) * 100; // Annualized volatility
};

export const calculateSMA = (prices: number[], periods: number): number[] => {
  const sma: number[] = [];
  
  for (let i = periods - 1; i < prices.length; i++) {
    const sum = prices.slice(i - periods + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / periods);
  }
  
  return sma;
};

export const calculateEMA = (prices: number[], periods: number): number[] => {
  const ema: number[] = [];
  const multiplier = 2 / (periods + 1);
  
  // First EMA value is the SMA
  const firstSMA = prices.slice(0, periods).reduce((a, b) => a + b, 0) / periods;
  ema.push(firstSMA);
  
  for (let i = periods; i < prices.length; i++) {
    const emaValue = (prices[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier));
    ema.push(emaValue);
  }
  
  return ema;
};

// Validation utilities
export const validatePositionSize = (
  size: number,
  availableBalance: number,
  leverage: number,
  minSize: number = 10
): { isValid: boolean; error?: string } => {
  if (size < minSize) {
    return { isValid: false, error: `Minimum position size is $${minSize}` };
  }
  
  const requiredMargin = size / leverage;
  if (requiredMargin > availableBalance) {
    return { isValid: false, error: "Insufficient balance for this position size" };
  }
  
  return { isValid: true };
};

export const validateLeverage = (
  leverage: number,
  maxLeverage: number = 100
): { isValid: boolean; error?: string } => {
  if (leverage < 0.1) {
    return { isValid: false, error: "Minimum leverage is 0.1x" };
  }
  
  if (leverage > maxLeverage) {
    return { isValid: false, error: `Maximum leverage is ${maxLeverage}x` };
  }
  
  return { isValid: true };
};

// Constants
export const TRADING_PAIRS = [
  "BTC/USD",
  "ETH/USD",
  "AVAX/USD",
  "SHIBA/USD",
] as const;

export const ORDER_TYPES = [
  "MARKET",
  "LIMIT",
  "STOP_LOSS", 
  "TAKE_PROFIT",
] as const;

export const POSITION_SIDES = ["LONG", "SHORT"] as const;

export const DEFAULT_LEVERAGE = 2;
export const MAX_LEVERAGE = 100;
export const MIN_LEVERAGE = 0.1;
export const DEFAULT_SLIPPAGE = 0.5;
export const MAX_SLIPPAGE = 5;
export const TRADING_FEE_RATE = 0.001; // 0.1%
export const FUNDING_RATE_INTERVAL = 8; // hours

// Mock data generators for development
export const generateMockCandlesticks = (
  basePrice: number,
  count: number = 100
): Array<{ open: number; high: number; low: number; close: number; volume: number }> => {
  const candles = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < count; i++) {
    const open = currentPrice + (Math.random() - 0.5) * (basePrice * 0.01);
    const close = open + (Math.random() - 0.5) * (basePrice * 0.02);
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.01);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.01);
    const volume = Math.random() * 1000000;
    
    candles.push({ open, high, low, close, volume });
    currentPrice = close;
  }
  
  return candles;
};

export const generateMockMarketData = (): MarketData[] => {
  return [
    {
      id: "1",
      symbol: "BTC/USD",
      price: "67235.42",
      volume24h: "12400000",
      change24h: "2.34",
      openInterest: "89200000",
      availableLiquidity: "45800000",
      fundingRate: "0.0045",
      updatedAt: new Date(),
    },
    {
      id: "2", 
      symbol: "ETH/USD",
      price: "3567.89",
      volume24h: "8900000",
      change24h: "-1.23",
      openInterest: "56700000",
      availableLiquidity: "28900000",
      fundingRate: "-0.0023",
      updatedAt: new Date(),
    },
  ];
};
