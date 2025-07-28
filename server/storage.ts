import { 
  type User, 
  type InsertUser, 
  type Position, 
  type InsertPosition, 
  type Order, 
  type InsertOrder, 
  type Trade, 
  type InsertTrade, 
  type LiquidityPool, 
  type InsertLiquidityPool, 
  type UserLiquidity, 
  type InsertUserLiquidity, 
  type StakingPosition, 
  type InsertStakingPosition, 
  type Referral, 
  type InsertReferral, 
  type MarketData
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Positions
  getPositions(userId: string): Promise<Position[]>;
  getPosition(id: string): Promise<Position | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: string, updates: Partial<Position>): Promise<Position>;
  closePosition(id: string): Promise<Position>;

  // Orders
  getOrders(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order>;
  cancelOrder(id: string): Promise<Order>;

  // Trades
  getTrades(userId: string): Promise<Trade[]>;
  createTrade(trade: InsertTrade): Promise<Trade>;

  // Liquidity Pools
  getLiquidityPools(): Promise<LiquidityPool[]>;
  getLiquidityPool(id: string): Promise<LiquidityPool | undefined>;
  createLiquidityPool(pool: InsertLiquidityPool): Promise<LiquidityPool>;

  // User Liquidity
  getUserLiquidity(userId: string): Promise<UserLiquidity[]>;
  addUserLiquidity(liquidity: InsertUserLiquidity): Promise<UserLiquidity>;
  removeUserLiquidity(id: string): Promise<void>;

  // Staking
  getStakingPositions(userId: string): Promise<StakingPosition[]>;
  createStakingPosition(position: InsertStakingPosition): Promise<StakingPosition>;
  updateStakingPosition(id: string, updates: Partial<StakingPosition>): Promise<StakingPosition>;

  // Referrals
  getReferrals(referrerId: string): Promise<Referral[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  updateReferralEarnings(referrerId: string, refereeId: string, volume: string, earnings: string): Promise<void>;

  // Market Data
  getMarketData(): Promise<MarketData[]>;
  getMarketDataBySymbol(symbol: string): Promise<MarketData | undefined>;
  updateMarketData(symbol: string, data: Partial<MarketData>): Promise<MarketData>;

  // User balance management
  updateUserBalance(userId: string, token: string, amount: number): Promise<void>;
  getUserBalance(userId: string): Promise<{ [key: string]: number }>;
}

export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private usersByAddress: Map<string, User> = new Map();
  private positions: Map<string, Position> = new Map();
  private orders: Map<string, Order> = new Map();
  private trades: Map<string, Trade> = new Map();
  private liquidityPools: Map<string, LiquidityPool> = new Map();
  private userLiquidity: Map<string, UserLiquidity> = new Map();
  private stakingPositions: Map<string, StakingPosition> = new Map();
  private referrals: Map<string, Referral> = new Map();
  private marketData: Map<string, MarketData> = new Map();

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByAddress(address: string): Promise<User | undefined> {
    return this.usersByAddress.get(address);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: nanoid(),
      createdAt: new Date(),
      referralCode: null,
      referredBy: null,
      balance: { BTC: 0.1, ETH: 2.5, USDC: 10000, USDT: 10000, SHIBA: 1000000 },
      ...insertUser
    };
    this.users.set(user.id, user);
    this.usersByAddress.set(user.address, user);
    return user;
  }

    async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    const updated = { 
      ...user, 
      ...updates, 
    };
    this.users.set(id, updated);
    return updated;
  }

  // Positions
  async getPositions(userId: string): Promise<Position[]> {
    return Array.from(this.positions.values()).filter(p => p.userId === userId);
  }

  async getPosition(id: string): Promise<Position | undefined> {
    return this.positions.get(id);
  }

  async createPosition(insertPosition: InsertPosition): Promise<Position> {
    const position: Position = {
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isOpen: true,
      pnl: "0",
      markPrice: null,
      liquidationPrice: null,
      ...insertPosition
    };
    this.positions.set(position.id, position);
    return position;
  }

  async updatePosition(id: string, updates: Partial<Position>): Promise<Position> {
    const position = this.positions.get(id);
    if (!position) {
      throw new Error("Position not found");
    }
    const updated = { 
      ...position, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.positions.set(id, updated);
    return updated;
  }

  async closePosition(id: string): Promise<Position> {
    return this.updatePosition(id, { isOpen: false });
  }

  // Orders
  async getOrders(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.userId === userId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const order: Order = {
      id: nanoid(),
      createdAt: new Date(),
      status: "PENDING",
      price: null,
      triggerPrice: null,
      ...insertOrder
    };
    this.orders.set(order.id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) {
      throw new Error("Order not found");
    }
    const updated = { ...order, ...updates };
    this.orders.set(id, updated);
    return updated;
  }

  async cancelOrder(id: string): Promise<Order> {
    return this.updateOrder(id, { status: "CANCELLED" });
  }

  // Trades
  async getTrades(userId: string): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter(t => t.userId === userId);
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const trade: Trade = {
      id: nanoid(),
      createdAt: new Date(),
      pnl: "0",
      ...insertTrade
    };
    this.trades.set(trade.id, trade);
    return trade;
  }

  // Liquidity Pools
  async getLiquidityPools(): Promise<LiquidityPool[]> {
    return Array.from(this.liquidityPools.values());
  }

  async getLiquidityPool(id: string): Promise<LiquidityPool | undefined> {
    return this.liquidityPools.get(id);
  }

  async createLiquidityPool(insertPool: InsertLiquidityPool): Promise<LiquidityPool> {
    const pool: LiquidityPool = {
      id: nanoid(),
      totalLiquidity: "0",
      apr: "0",
      composition: null,
      ...insertPool
    };
    this.liquidityPools.set(pool.id, pool);
    return pool;
  }

  // User Liquidity
  async getUserLiquidity(userId: string): Promise<UserLiquidity[]> {
    return Array.from(this.userLiquidity.values()).filter(l => l.userId === userId);
  }

  async addUserLiquidity(insertLiquidity: InsertUserLiquidity): Promise<UserLiquidity> {
    const liquidity: UserLiquidity = {
      id: nanoid(),
      createdAt: new Date(),
      status: "ACTIVE",
      shares: insertLiquidity.amount1 + insertLiquidity.amount2, // Simple share calculation
      ...insertLiquidity
    };
    this.userLiquidity.set(liquidity.id, liquidity);
    return liquidity;
  }

  async removeUserLiquidity(id: string): Promise<void> {
    this.userLiquidity.delete(id);
  }

  // Staking
  async getStakingPositions(userId: string): Promise<StakingPosition[]> {
    return Array.from(this.stakingPositions.values()).filter(s => s.userId === userId);
  }

  async createStakingPosition(insertPosition: InsertStakingPosition): Promise<StakingPosition> {
    const position: StakingPosition = {
      id: nanoid(),
      createdAt: new Date(),
      rewards: "0",
      apr: "0",
      ...insertPosition
    };
    this.stakingPositions.set(position.id, position);
    return position;
  }

  async updateStakingPosition(id: string, updates: Partial<StakingPosition>): Promise<StakingPosition> {
    const position = this.stakingPositions.get(id);
    if (!position) {
      throw new Error("Staking position not found");
    }
    const updated = { ...position, ...updates };
    this.stakingPositions.set(id, updated);
    return updated;
  }

  // Referrals
  async getReferrals(referrerId: string): Promise<Referral[]> {
    return Array.from(this.referrals.values()).filter(r => r.referrerId === referrerId);
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const referral: Referral = {
      id: nanoid(),
      createdAt: new Date(),
      volume: "0",
      earnings: "0",
      ...insertReferral
    };
    this.referrals.set(referral.id, referral);
    return referral;
  }

  async updateReferralEarnings(referrerId: string, refereeId: string, volume: string, earnings: string): Promise<void> {
    const referral = Array.from(this.referrals.values()).find(r => r.referrerId === referrerId);

    if (referral) {
      const currentVolume = parseFloat(referral.volume || "0");
      const currentEarnings = parseFloat(referral.earnings || "0");

      const updated = {
        ...referral,
        volume: (currentVolume + parseFloat(volume)).toString(),
        earnings: (currentEarnings + parseFloat(earnings)).toString()
      };
      this.referrals.set(referral.id, updated);
    }
  }

  // Market Data
  async getMarketData(): Promise<MarketData[]> {
    return Array.from(this.marketData.values());
  }

  async getMarketDataBySymbol(symbol: string): Promise<MarketData | undefined> {
    return this.marketData.get(symbol);
  }

  async updateMarketData(symbol: string, data: Partial<MarketData>): Promise<MarketData> {
    const existing = this.marketData.get(symbol);
    if (!existing) {
      // Create new market data entry if it doesn't exist
      const newData: MarketData = {
        id: nanoid(),
        symbol,
        price: "0",
        change24h: "0",
        volume24h: "0",
        openInterest: null,
        availableLiquidity: null,
        fundingRate: null,
        updatedAt: new Date(),
        ...data
      };
      this.marketData.set(symbol, newData);
      return newData;
    }
    const updated = { 
      ...existing, 
      ...data, 
      updatedAt: new Date() 
    };
    this.marketData.set(symbol, updated);
    return updated;
  }

  // User balance management
  async updateUserBalance(userId: string, token: string, amount: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      if (!user.balance) user.balance = { BTC: 0.1, ETH: 2.5, USDC: 10000, USDT: 10000, SHIBA: 1000000 };
      user.balance[token] = amount; // Set absolute amount instead of adding
      this.users.set(userId, user);
      this.usersByAddress.set(user.address, user);
    }
  }

  async getUserBalance(userId: string, token?: string): Promise<any> {
    const user = this.users.get(userId);
    const defaultBalance = { BTC: 0.1, ETH: 2.5, USDC: 10000, USDT: 10000, SHIBA: 1000000 };
    const balance = user?.balance || defaultBalance;
    
    if (token) {
      return balance[token] || 0;
    }
    
    return balance;
  }

  // Add method to create user liquidity  
  async createUserLiquidity(insertLiquidity: InsertUserLiquidity): Promise<UserLiquidity> {
    const liquidity: UserLiquidity = {
      id: nanoid(),
      createdAt: new Date(),
      status: "ACTIVE",
      shares: insertLiquidity.amount1 + insertLiquidity.amount2, // Simple share calculation
      ...insertLiquidity
    };
    this.userLiquidity.set(liquidity.id, liquidity);
    return liquidity;
  }
}

export const storage = new MemoryStorage();

// Initialize memory storage with sample data
export async function initializeDatabase() {
  try {
    // Check if market data already exists
    const existingData = await storage.getMarketData();
    if (existingData.length > 0) {
      console.log('Storage already initialized with market data');
      return;
    }

    // Insert sample market data directly into memory storage
    const marketDataEntries = [
      {
        symbol: 'BTC/USD',
        price: '67235.42',
        change24h: '2.34',
        volume24h: '124000000',
        openInterest: '892000000',
        availableLiquidity: '458000000',
        fundingRate: '0.0045'
      },
      {
        symbol: 'ETH/USD',
        price: '3421.67',
        change24h: '1.89',
        volume24h: '89000000',
        openInterest: '456000000',
        availableLiquidity: '289000000',
        fundingRate: '-0.0023'
      },
      {
        symbol: 'USDC/USD',
        price: '1.00',
        change24h: '0.01',
        volume24h: '21000000',
        openInterest: '123000000',
        availableLiquidity: '156000000',
        fundingRate: '0.0001'
      },
      {
        symbol: 'SHIBA/USD',
        price: '0.000024',
        change24h: '5.67',
        volume24h: '5670000',
        openInterest: '8900000',
        availableLiquidity: '2340000',
        fundingRate: '0.0089'
      }
    ];

    // Initialize market data
    for (const data of marketDataEntries) {
      const marketDataItem: MarketData = {
        id: nanoid(),
        updatedAt: new Date(),
        ...data
      };
      (storage as any).marketData.set(data.symbol, marketDataItem);
    }

    // Insert sample liquidity pools
    await storage.createLiquidityPool({
      symbol: 'SLP',
      name: 'ShibaU Liquidity Pool',
      totalLiquidity: '89400000',
      apr: '12.4',
      composition: {
        BTC: 23.4,
        ETH: 31.2,
        USDC: 45.4
      }
    });

    await storage.createLiquidityPool({
      symbol: 'SHIBA-ETH',
      name: 'SHIBA-ETH Pool',
      totalLiquidity: '34200000',
      apr: '18.7',
      composition: {
        SHIBA: 50.0,
        ETH: 50.0
      }
    });

    console.log('Storage initialized successfully with sample data');
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}