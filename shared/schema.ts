import { z } from "zod";

// User Schema
export const insertUserSchema = z.object({
  address: z.string(),
  referralCode: z.string().nullable().optional(),
  referredBy: z.string().nullable().optional(),
});

export const userSchema = insertUserSchema.extend({
  id: z.string(),
  createdAt: z.date().nullable(),
});

// Position Schema
export const insertPositionSchema = z.object({
  userId: z.string(),
  market: z.string(),
  side: z.string(),
  size: z.string(),
  collateral: z.string(),
  entryPrice: z.string(),
  leverage: z.string(),
  markPrice: z.string().nullable().optional(),
  liquidationPrice: z.string().nullable().optional(),
});

export const positionSchema = insertPositionSchema.extend({
  id: z.string(),
  markPrice: z.string().nullable(),
  liquidationPrice: z.string().nullable(),
  pnl: z.string().nullable(),
  isOpen: z.boolean().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

// Order Schema
export const insertOrderSchema = z.object({
  userId: z.string(),
  market: z.string(),
  type: z.string(),
  side: z.string(),
  size: z.string(),
  price: z.string().nullable().optional(),
  triggerPrice: z.string().nullable().optional(),
});

export const orderSchema = insertOrderSchema.extend({
  id: z.string(),
  price: z.string().nullable(),
  triggerPrice: z.string().nullable(),
  status: z.string().nullable(),
  createdAt: z.date().nullable(),
});

// Trade Schema
export const insertTradeSchema = z.object({
  userId: z.string(),
  market: z.string(),
  side: z.string(),
  size: z.string(),
  price: z.string(),
  fee: z.string(),
});

export const tradeSchema = insertTradeSchema.extend({
  id: z.string(),
  pnl: z.string().nullable(),
  createdAt: z.date().nullable(),
});

// Liquidity Pool Schema
export const insertLiquidityPoolSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  totalLiquidity: z.string().nullable().optional(),
  apr: z.string().nullable().optional(),
  composition: z.any().nullable().optional(),
});

export const liquidityPoolSchema = insertLiquidityPoolSchema.extend({
  id: z.string(),
  totalLiquidity: z.string().nullable(),
  apr: z.string().nullable(),
  composition: z.any(),
});

// User Liquidity Schema
export const insertUserLiquiditySchema = z.object({
  userId: z.string(),
  poolId: z.string(),
  amount: z.string(),
  shares: z.string(),
});

export const userLiquiditySchema = insertUserLiquiditySchema.extend({
  id: z.string(),
  createdAt: z.date().nullable(),
});

// Staking Position Schema
export const insertStakingPositionSchema = z.object({
  userId: z.string(),
  tokenSymbol: z.string(),
  amount: z.string(),
  apr: z.string().nullable().optional(),
});

export const stakingPositionSchema = insertStakingPositionSchema.extend({
  id: z.string(),
  rewards: z.string().nullable(),
  apr: z.string().nullable(),
  createdAt: z.date().nullable(),
});

// Referral Schema
export const insertReferralSchema = z.object({
  referrerId: z.string(),
  refereeId: z.string(),
});

export const referralSchema = insertReferralSchema.extend({
  id: z.string(),
  volume: z.string().nullable(),
  earnings: z.string().nullable(),
  createdAt: z.date().nullable(),
});

// Market Data Schema
export const insertMarketDataSchema = z.object({
  symbol: z.string(),
  price: z.string(),
  volume24h: z.string().optional(),
  change24h: z.string().optional(),
  openInterest: z.string().optional(),
  availableLiquidity: z.string().optional(),
  fundingRate: z.string().optional(),
});

export const marketDataSchema = insertMarketDataSchema.extend({
  id: z.string(),
  volume24h: z.string().nullable(),
  change24h: z.string().nullable(),
  openInterest: z.string().nullable(),
  availableLiquidity: z.string().nullable(),
  fundingRate: z.string().nullable(),
  updatedAt: z.date().nullable(),
});

// Types
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Position = z.infer<typeof positionSchema>;
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Trade = z.infer<typeof tradeSchema>;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type LiquidityPool = z.infer<typeof liquidityPoolSchema>;
export type InsertLiquidityPool = z.infer<typeof insertLiquidityPoolSchema>;
export type UserLiquidity = z.infer<typeof userLiquiditySchema>;
export type InsertUserLiquidity = z.infer<typeof insertUserLiquiditySchema>;
export type StakingPosition = z.infer<typeof stakingPositionSchema>;
export type InsertStakingPosition = z.infer<typeof insertStakingPositionSchema>;
export type Referral = z.infer<typeof referralSchema>;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type MarketData = z.infer<typeof marketDataSchema>;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;
