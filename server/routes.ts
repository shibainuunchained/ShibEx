import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { marketAPI } from "./market-api";
import { insertPositionSchema, insertOrderSchema, insertTradeSchema, insertUserSchema, insertReferralSchema, insertUserLiquiditySchema, insertStakingPositionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Add CORS headers for deployed version
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // WebSocket server for real-time data
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    // Send initial market data
    const sendMarketData = async () => {
      const marketData = await storage.getMarketData();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'market_data', data: marketData }));
      }
    };

    sendMarketData();

    // Send market data updates every 30 seconds with real data
    const marketDataInterval = setInterval(async () => {
      try {
        const livePrices = await marketAPI.getLivePrices();

        // Update storage with real prices
        for (const priceData of livePrices) {
          try {
            await storage.updateMarketData(priceData.symbol, {
              price: priceData.price,
              change24h: priceData.change24h,
              volume24h: priceData.volume,
              updatedAt: new Date()
            });
          } catch (error) {
            console.error(`Failed to update market data for ${priceData.symbol}:`, error);
          }
        }

        await sendMarketData();
      } catch (error) {
        console.error('Error updating market data:', error);
      }
    }, 30000);

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      clearInterval(marketDataInterval);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(marketDataInterval);
    });
  });

  // API Routes

  // Users
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:address", async (req, res) => {
    try {
      const user = await storage.getUserByAddress(req.params.address);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user balance
  app.get("/api/users/:userId/balance", async (req, res) => {
    try {
      const balance = await storage.getUserBalance(req.params.userId);
      res.json(balance);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Positions
  app.get("/api/positions/:userId", async (req, res) => {
    try {
      const positions = await storage.getPositions(req.params.userId);
      res.json(positions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create position
  app.post("/api/positions", async (req, res) => {
    try {
      const position = insertPositionSchema.parse(req.body);

      // Parse string values for calculations
      const size = parseFloat(position.size);
      const entryPrice = parseFloat(position.entryPrice);
      const leverage = parseFloat(position.leverage);
      const collateral = parseFloat(position.collateral);

      // Get user's USDT balance
      const balance = await storage.getUserBalance(position.userId, 'USDT');
      const requiredAmount = collateral; // Use the collateral amount calculated on frontend

      console.log(`Position creation - User: ${position.userId}, Required: ${requiredAmount}, Balance: ${balance}`);

      if (balance < requiredAmount) {
        return res.status(400).json({ message: `Insufficient balance. Required: ${requiredAmount.toFixed(2)} USDT, Available: ${balance.toFixed(2)} USDT` });
      }

      // Deduct balance first
      const newBalance = balance - requiredAmount;
      await storage.updateUserBalance(position.userId, 'USDT', newBalance);
      console.log(`Balance updated from ${balance} to ${newBalance} USDT`);

      // Create position
      const newPosition = await storage.createPosition(position);
      res.json(newPosition);
    } catch (error: any) {
      console.error('Position creation error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/positions/:id", async (req, res) => {
    try {
      const position = await storage.updatePosition(req.params.id, req.body);
      res.json(position);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/positions/:id/close", async (req, res) => {
    try {
      const position = await storage.closePosition(req.params.id);
      res.json(position);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Orders
  app.get("/api/orders/:userId", async (req, res) => {
    try {
      const orders = await storage.getOrders(req.params.userId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.updateOrder(req.params.id, req.body);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.cancelOrder(req.params.id);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Trades
  app.get("/api/trades/:userId", async (req, res) => {
    try {
      const trades = await storage.getTrades(req.params.userId);
      res.json(trades);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/trades", async (req, res) => {
    try {
      const tradeData = insertTradeSchema.parse(req.body);
      const trade = await storage.createTrade(tradeData);
      res.json(trade);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Liquidity Pools
  app.get("/api/pools", async (req, res) => {
    try {
      const pools = await storage.getLiquidityPools();
      res.json(pools);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User liquidity positions
  app.get("/api/users/:userId/liquidity", async (req, res) => {
    try {
      const { userId } = req.params;
      const liquidity = await storage.getUserLiquidity(userId);
      res.json(liquidity);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/liquidity", async (req, res) => {
    try {
      const liquidity = insertUserLiquiditySchema.parse(req.body);

      console.log(`Liquidity request - User: ${liquidity.userId}, ${liquidity.amount1} ${liquidity.token1} + ${liquidity.amount2} ${liquidity.token2}`);

      // Get user's balance for both tokens
      const token1Balance = await storage.getUserBalance(liquidity.userId, liquidity.token1);
      const token2Balance = await storage.getUserBalance(liquidity.userId, liquidity.token2);

      if (token1Balance < liquidity.amount1 || token2Balance < liquidity.amount2) {
        return res.status(400).json({ 
          message: `Insufficient balance. ${liquidity.token1}: ${token1Balance.toFixed(6)}/${liquidity.amount1}, ${liquidity.token2}: ${token2Balance.toFixed(6)}/${liquidity.amount2}` 
        });
      }

      // Deduct balances
      const newToken1Balance = token1Balance - liquidity.amount1;
      const newToken2Balance = token2Balance - liquidity.amount2;

      await storage.updateUserBalance(liquidity.userId, liquidity.token1, newToken1Balance);
      await storage.updateUserBalance(liquidity.userId, liquidity.token2, newToken2Balance);

      console.log(`Liquidity balances updated - ${liquidity.token1}: ${token1Balance} -> ${newToken1Balance}, ${liquidity.token2}: ${token2Balance} -> ${newToken2Balance}`);

      const newLiquidity = await storage.createUserLiquidity(liquidity);
      res.json(newLiquidity);
    } catch (error: any) {
      console.error('Liquidity error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Staking
  app.get("/api/staking/:userId", async (req, res) => {
    try {
      const positions = await storage.getStakingPositions(req.params.userId);
      res.json(positions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create staking position
  app.post("/api/staking", async (req, res) => {
    try {
      const staking = insertStakingPositionSchema.parse(req.body);

      console.log(`Staking request - User: ${staking.userId}, Amount: ${staking.amount} ${staking.token}`);

      // Get user's balance
      const balance = await storage.getUserBalance(staking.userId, staking.token);

      if (balance < staking.amount) {
        return res.status(400).json({ 
          message: `Insufficient ${staking.token} balance. Required: ${staking.amount}, Available: ${balance.toFixed(6)}` 
        });
      }

      // Deduct balance
      const newBalance = balance - staking.amount;
      await storage.updateUserBalance(staking.userId, staking.token, newBalance);

      console.log(`Staking balance updated - ${staking.token}: ${balance} -> ${newBalance}`);

      const newStaking = await storage.createStakingPosition(staking);
      res.json(newStaking);
    } catch (error: any) {
      console.error('Staking error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Referrals
  app.get("/api/referrals/:referrerId", async (req, res) => {
    try {
      const referrals = await storage.getReferrals(req.params.referrerId);
      res.json(referrals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/referrals", async (req, res) => {
    try {
      const referralData = insertReferralSchema.parse(req.body);
      const referral = await storage.createReferral(referralData);
      res.json(referral);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Market data endpoint
  app.get("/api/market-data", async (req, res) => {
    try {
      const marketData = await storage.getMarketData();
      res.json(marketData);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  // Chart data endpoint
  app.get("/api/chart/:symbol/:timeframe", async (req, res) => {
    try {
      const { symbol, timeframe } = req.params;
      const decodedSymbol = decodeURIComponent(symbol);
      console.log(`Fetching chart data for ${decodedSymbol}, timeframe: ${timeframe}`);
      const chartData = await marketAPI.getChartData(decodedSymbol, timeframe);
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });

  // Swap tokens
  app.post("/api/swap", async (req, res) => {
    try {
      const { userId, fromToken, toToken, fromAmount, toAmount } = req.body;

      console.log(`Swap request - User: ${userId}, From: ${fromAmount} ${fromToken}, To: ${toAmount} ${toToken}`);

      // Get user's balance for the from token
      const balance = await storage.getUserBalance(userId, fromToken);

      if (balance < fromAmount) {
        return res.status(400).json({ 
          message: `Insufficient ${fromToken} balance. Required: ${fromAmount}, Available: ${balance.toFixed(6)}` 
        });
      }

      // Calculate fee (0.1%)
      const fee = fromAmount * 0.001;
      const actualToAmount = toAmount - (toAmount * 0.001); // Deduct fee from output

      // Update balances
      const newFromBalance = balance - fromAmount;
      const toBalance = await storage.getUserBalance(userId, toToken);
      const newToBalance = toBalance + actualToAmount;

      await storage.updateUserBalance(userId, fromToken, newFromBalance);
      await storage.updateUserBalance(userId, toToken, newToBalance);

      console.log(`Swap completed - ${fromToken}: ${balance} -> ${newFromBalance}, ${toToken}: ${toBalance} -> ${newToBalance}`);

      // Create trade record
      const trade = await storage.createTrade({
        id: `trade_${Date.now()}`,
        userId,
        symbol: `${fromToken}/${toToken}`,
        side: "BUY",
        size: fromAmount,
        price: toAmount / fromAmount,
        fee,
        pnl: 0,
        createdAt: new Date()
      });

      res.json({ success: true, trade, newBalances: { [fromToken]: newFromBalance, [toToken]: newToBalance } });
    } catch (error: any) {
      console.error('Swap error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  return httpServer;
}