const express = require('express');
const { createServer } = require('http');
const path = require('path');

// Import the built server
const serverPath = path.join(__dirname, '..', 'dist', 'index.js');

let app;

// Initialize the app
const initApp = async () => {
  if (!app) {
    try {
      // Import the built server
      const { default: serverApp } = await import(serverPath);
      app = serverApp;
    } catch (error) {
      console.error('Failed to import server:', error);
      app = express();
      app.get('*', (req, res) => {
        res.status(500).json({ error: 'Server initialization failed' });
      });
    }
  }
  return app;
};

// Export for serverless
module.exports = async (req, res) => {
  const app = await initApp();
  return app(req, res);
};

// Health check
app = express();
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// For Vercel
module.exports.default = module.exports;
const cors = require('cors');

app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5000', 'https://your-app.vercel.app'],
  credentials: true
}));
app.use(express.json());

// In-memory storage
const storage = {
  users: new Map(),
  positions: new Map(),
  orders: new Map(),
  trades: new Map(),
  marketData: new Map()
};

// Market data with live prices
const marketData = [
  { id: 'bitcoin', symbol: 'BTC/USD', price: '67235.42', change24h: '2.34', volume: '28500000000' },
  { id: 'ethereum', symbol: 'ETH/USD', price: '3567.89', change24h: '-1.23', volume: '15600000000' },
  { id: 'usd-coin', symbol: 'USDC/USD', price: '1.00', change24h: '0.01', volume: '4200000000' },
  { id: 'shiba-inu', symbol: 'SHIBA/USD', price: '0.000022', change24h: '5.67', volume: '890000000' }
];

// User balances
const userBalances = new Map();

// Helper function to get or create user balance
function getUserBalance(userId) {
  if (!userBalances.has(userId)) {
    userBalances.set(userId, {
      BTC: "0.0234",
      ETH: "1.567",
      USDC: "10234.56",
      SHIBA: "1234567"
    });
  }
  return userBalances.get(userId);
}

// Routes
app.get('/api/market-data', (req, res) => {
  res.json(marketData);
});

app.post('/api/users', (req, res) => {
  const { address, referralCode, referredBy } = req.body;
  
  if (storage.users.has(address)) {
    return res.json(storage.users.get(address));
  }
  
  const user = {
    id: address,
    address,
    referralCode,
    referredBy,
    createdAt: new Date()
  };
  
  storage.users.set(address, user);
  
  // Initialize user balance
  getUserBalance(address);
  
  res.json(user);
});

app.get('/api/users/:address', (req, res) => {
  const user = storage.users.get(req.params.address);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.get('/api/users/:userId/balance', (req, res) => {
  const balance = getUserBalance(req.params.userId);
  res.json(balance);
});

app.post('/api/positions', (req, res) => {
  const { userId, market, side, size, collateral, entryPrice, leverage } = req.body;
  
  // Check if user has enough balance
  const balance = getUserBalance(userId);
  const sizeNum = parseFloat(size);
  
  if (parseFloat(balance.USDC) < sizeNum) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  
  // Deduct from balance
  balance.USDC = (parseFloat(balance.USDC) - sizeNum).toString();
  userBalances.set(userId, balance);
  
  const position = {
    id: Date.now().toString(),
    userId,
    market,
    side,
    size,
    collateral,
    entryPrice,
    leverage,
    markPrice: entryPrice,
    liquidationPrice: side === "LONG" ? 
      (parseFloat(entryPrice) * (1 - 1 / parseFloat(leverage) * 0.9)).toString() :
      (parseFloat(entryPrice) * (1 + 1 / parseFloat(leverage) * 0.9)).toString(),
    pnl: "0",
    isOpen: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  storage.positions.set(position.id, position);
  
  // Create trade record
  const trade = {
    id: Date.now().toString() + '_trade',
    userId,
    market,
    side,
    size,
    price: entryPrice,
    fee: (sizeNum * 0.001).toString(),
    pnl: "0",
    createdAt: new Date()
  };
  
  storage.trades.set(trade.id, trade);
  
  res.json(position);
});

app.get('/api/positions/:userId', (req, res) => {
  const positions = Array.from(storage.positions.values())
    .filter(p => p.userId === req.params.userId && p.isOpen);
  res.json(positions);
});

app.post('/api/positions/:positionId/close', (req, res) => {
  const position = storage.positions.get(req.params.positionId);
  if (!position) {
    return res.status(404).json({ error: 'Position not found' });
  }
  
  // Return collateral to balance
  const balance = getUserBalance(position.userId);
  balance.USDC = (parseFloat(balance.USDC) + parseFloat(position.collateral)).toString();
  userBalances.set(position.userId, balance);
  
  position.isOpen = false;
  position.updatedAt = new Date();
  storage.positions.set(position.id, position);
  
  res.json(position);
});

app.post('/api/orders', (req, res) => {
  const { userId, market, type, side, size, price, triggerPrice } = req.body;
  
  const order = {
    id: Date.now().toString(),
    userId,
    market,
    type,
    side,
    size,
    price,
    triggerPrice,
    status: 'PENDING',
    createdAt: new Date()
  };
  
  storage.orders.set(order.id, order);
  res.json(order);
});

app.get('/api/orders/:userId', (req, res) => {
  const orders = Array.from(storage.orders.values())
    .filter(o => o.userId === req.params.userId);
  res.json(orders);
});

app.delete('/api/orders/:orderId', (req, res) => {
  storage.orders.delete(req.params.orderId);
  res.json({ success: true });
});

app.get('/api/trades/:userId', (req, res) => {
  const trades = Array.from(storage.trades.values())
    .filter(t => t.userId === req.params.userId);
  res.json(trades);
});

// Swap endpoint with balance deduction
app.post('/api/swap', (req, res) => {
  const { userId, fromToken, toToken, fromAmount, toAmount } = req.body;
  
  const balance = getUserBalance(userId);
  const fromAmountNum = parseFloat(fromAmount);
  
  // Check balance
  if (parseFloat(balance[fromToken]) < fromAmountNum) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  
  // Execute swap
  balance[fromToken] = (parseFloat(balance[fromToken]) - fromAmountNum).toString();
  balance[toToken] = (parseFloat(balance[toToken]) + parseFloat(toAmount)).toString();
  
  userBalances.set(userId, balance);
  
  res.json({ success: true, newBalance: balance });
});

// Staking endpoint with balance deduction
app.post('/api/stake', (req, res) => {
  const { userId, tokenSymbol, amount } = req.body;
  
  const balance = getUserBalance(userId);
  const amountNum = parseFloat(amount);
  
  // Check balance
  if (parseFloat(balance[tokenSymbol]) < amountNum) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  
  // Deduct from balance
  balance[tokenSymbol] = (parseFloat(balance[tokenSymbol]) - amountNum).toString();
  userBalances.set(userId, balance);
  
  const stakingPosition = {
    id: Date.now().toString(),
    userId,
    tokenSymbol,
    amount: amount,
    apr: "12.5",
    rewards: "0",
    createdAt: new Date()
  };
  
  res.json({ success: true, stakingPosition, newBalance: balance });
});