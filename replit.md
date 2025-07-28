# ShibaU Trading Platform

## Overview

ShibaU is a comprehensive DeFi trading platform that provides cryptocurrency trading, yield farming, staking, and social features. The application is built with a modern full-stack architecture using React, TypeScript, Express.js, and PostgreSQL with WebSocket integration for real-time market data.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack) for server state
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Storage**: In-memory storage for all data persistence
- **Real-time**: WebSocket server for live market data updates
- **Session Management**: Express sessions with memory storage

### Key Components

#### Trading Engine
- Real-time market data with WebSocket connections
- Position management for long/short trades
- Order execution system (market, limit, stop-loss, take-profit)
- Leverage trading with liquidation protection
- PnL calculations and risk management

#### DeFi Features
- Liquidity pools for yield farming
- Staking mechanisms for token rewards
- Token swapping functionality
- Multi-asset support (BTC, ETH, USDC, SHIBA)

#### Social Features
- Referral system with commission tracking
- Leaderboard for top traders
- Performance analytics and statistics

#### User Interface
- Responsive design with mobile support
- Dark theme with custom color scheme
- Real-time chart visualization
- Trading forms with validation
- Portfolio dashboard

## Data Flow

1. **Client Connection**: Users connect via WebSocket for real-time data
2. **Market Data**: Server pushes live price updates every 5 seconds
3. **Trading Actions**: User actions trigger API calls to backend
4. **Memory Updates**: All trades, positions, and user data stored in memory
5. **State Synchronization**: React Query manages client-side cache and updates

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management
- **ws**: WebSocket implementation for real-time features
- **nanoid**: ID generation for in-memory storage

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight React router
- **react-hook-form**: Form handling with validation

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **zod**: TypeScript-first schema validation

## Deployment Strategy

### Development
- **Command**: `npm run dev` - Runs development server with hot reload
- **Storage**: In-memory data storage (no database required)
- **WebSocket**: Integrated with HTTP server for real-time features

### Production Build
- **Frontend**: `vite build` - Optimized React bundle
- **Backend**: `esbuild` - Compiled Node.js server
- **Start**: `npm start` - Production server

### Environment Configuration
- No database configuration required
- Supports Replit-specific plugins and configurations
- Uses in-memory storage for all data persistence

### File Structure
```
├── client/          # React frontend
├── server/          # Express.js backend
├── shared/          # Shared TypeScript types and schemas
├── shared/          # Shared TypeScript types and schemas
└── dist/           # Production build output
```

The architecture supports both development and production environments with appropriate tooling for each stage. The system uses in-memory storage and is designed to be deployed on platforms like Replit without any database dependencies or configuration.

## Vercel Deployment

The project is configured for easy deployment on Vercel:

### Setup Files
- `vercel.json`: Deployment configuration for serverless functions
- `.vercelignore`: Files to exclude from deployment
- Build scripts optimized for Vercel's build process

### Deployment Process
1. Push code to GitHub repository
2. Connect GitHub repository to Vercel
3. Vercel automatically builds and deploys
4. Frontend served as static files, backend as serverless functions

### Recent Changes (July 27, 2025)
- Converted from PostgreSQL database to in-memory storage
- Removed Drizzle ORM and database dependencies  
- Updated schema to use pure Zod validation
- Added Vercel deployment configuration
- Simplified architecture for serverless deployment
- Fixed macOS compatibility: Server now uses localhost for local development
- Added environment detection for proper host binding across platforms

#### Migration to Replit Environment (July 27, 2025)
- Successfully migrated from Replit Agent to full Replit environment
- Implemented complete wallet connection system with demo functionality
- Added functional trading system with real API integration
- Implemented working swap functionality with balance checking
- Added functional staking and liquidity provision systems
- Enhanced all interactive features to work properly for demos
- All buttons and forms now connect to backend APIs instead of being static
- Added proper wallet state management and user authentication
- Integrated real-time price updates and market data display

#### Live Market Data Integration (July 27, 2025)
- Integrated CoinGecko API with Binance fallback for real cryptocurrency prices
- Implemented live WebSocket price feeds updating every 30 seconds
- Added real balance management system for all trading operations
- Created functional swap, staking, and liquidity provision with balance validation
- Built dynamic chart component with real market data and working timeframe selection
- Fixed user creation system to handle demo users properly
- All operations now use authentic market data instead of mock data

#### Vercel Deployment Optimization (July 27, 2025)
- Fixed vercel.json configuration to resolve functions/builds property conflict
- Updated configuration to work with Vercel's framework preset detection
- Removed conflicting build properties to allow Vite framework auto-detection
- Added proper CORS headers and API routing for serverless deployment
- Platform ready for one-click deployment to Vercel with GitHub integration