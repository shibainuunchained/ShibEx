# ShibaU - Advanced Crypto Trading Platform

A modern, full-featured cryptocurrency trading platform built with React, TypeScript, and Express. Features real-time trading, staking, liquidity pools, and a comprehensive DeFi ecosystem.

## 🚀 Features

- **Real-time Trading**: Advanced trading interface with live charts and market data
- **Wallet Integration**: Connect and manage crypto walances across multiple assets
- **Staking Pools**: Earn rewards by staking tokens with competitive APY rates
- **Liquidity Provision**: Add liquidity to pools and earn trading fees
- **Swap Exchange**: Instant token swaps with minimal slippage
- **Portfolio Management**: Track positions, trades, and overall portfolio performance
- **Responsive Design**: Optimized for desktop and mobile devices

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Wouter** for routing
- **React Query** for data fetching
- **Recharts** for data visualization
- **Radix UI** for accessible components

### Backend
- **Express.js** server
- **WebSocket** for real-time data
- **Memory storage** (easily extensible to databases)
- **Market data APIs** (CoinGecko, Binance)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🔧 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd shibau-trading-platform
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
```

### 4. Start development server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deploy to Render

1. **Create a new Web Service** on [Render](https://render.com)

2. **Connect your repository**

3. **Configure build settings**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

4. **Set environment variables**:
   ```
   NODE_ENV=production
   PORT=10000
   ```

5. **Deploy** - Render will automatically build and deploy your application

### Deploy to Other Platforms

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Railway
```bash
npm install -g @railway/cli
railway login
railway deploy
```

#### Heroku
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## 🔧 Configuration

### Market Data APIs
The platform supports multiple data sources:
- **CoinGecko API** (primary)
- **Binance API** (fallback)
- **Static fallback data** (when APIs fail)

### WebSocket Configuration
Real-time data is provided via WebSocket connections. For serverless deployments, the app automatically falls back to HTTP polling.

## 📊 API Endpoints

### Trading
- `POST /api/positions` - Create trading position
- `GET /api/positions/:userId` - Get user positions
- `POST /api/positions/:id/close` - Close position

### Wallet & Balance
- `GET /api/users/:userId/balance` - Get user balance
- `POST /api/swap` - Execute token swap

### Staking & Liquidity
- `POST /api/staking` - Stake tokens
- `GET /api/staking/:userId` - Get staking positions
- `POST /api/liquidity` - Add liquidity
- `GET /api/pools` - Get liquidity pools

### Market Data
- `GET /api/market-data` - Get live market data
- `GET /api/chart/:symbol/:timeframe` - Get chart data
- `WebSocket /ws` - Real-time market updates

## 🎨 Customization

### Theming
The app uses CSS custom properties for theming. Modify `/client/src/index.css` to customize:
- Colors
- Typography
- Component styles

### Adding New Features
1. **Backend**: Add routes in `/server/routes.ts`
2. **Frontend**: Create components in `/client/src/components`
3. **Data**: Update storage in `/server/storage.ts`

## 🐛 Troubleshooting

### Common Issues

**1. White text in input fields**
- Fixed in latest version with proper CSS variables

**2. Chart not loading**
- Check network connection
- Verify API endpoints are accessible
- Fallback data should display automatically

**3. Balance not updating**
- Ensure WebSocket connection is active
- Check browser console for errors
- Refresh page to sync with server

**4. Trading errors**
- Verify sufficient balance
- Check position size requirements
- Ensure wallet is connected

### Development Issues

**Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Port Already in Use**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

## 📈 Performance Optimization

### Frontend
- Components are optimized with React.memo
- Lazy loading for heavy components
- Efficient state management with React Query

### Backend
- In-memory caching for market data
- Rate limiting for API calls
- Fallback data systems

## 🔒 Security

- Input validation on all endpoints
- CORS properly configured
- No sensitive data in client-side code
- Rate limiting implemented

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

Built with ❤️ for the crypto community