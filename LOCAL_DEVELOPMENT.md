# Local Development Setup

## macOS Fix for ENOTSUP Error

If you're running this project on macOS and encounter the error:
```
Error: listen ENOTSUP: operation not supported on socket 0.0.0.0:5000
```

This is because macOS doesn't support binding to `0.0.0.0` on certain ports. The server has been configured to automatically use `localhost` for local development.

## Running the Project Locally

### Option 1: Standard Development (Recommended)
```bash
npm install
npm run dev
```
The server will automatically use `localhost` for local development.

### Option 2: Alternative Port (If port 5000 is busy)
```bash
npm install
PORT=3000 npm run dev
```

### Option 3: Force Different Port
```bash
npm install
PORT=8080 NODE_ENV=development npx tsx server/index.ts
```

## Environment Detection

The server automatically detects the environment:
- **Local Development**: Uses `localhost` (macOS compatible)
- **Replit/Production**: Uses `0.0.0.0` (required for external access)

## Accessing the Application

Once running, open your browser to:
- `http://localhost:5000` (or whatever port you configured)

## Features Available Locally

✅ **Full Trading Platform**: All trading features work locally
✅ **Real-time Data**: WebSocket connections for live market updates  
✅ **In-Memory Storage**: No database setup required
✅ **Hot Reload**: Vite dev server with instant updates
✅ **API Testing**: All REST endpoints available

## Troubleshooting

1. **Port Already in Use**: Try a different port with `PORT=3001 npm run dev`
2. **Node Version**: Ensure you're using Node.js 18+ 
3. **Dependencies**: Run `npm install` to ensure all packages are installed
4. **Clear Cache**: Delete `node_modules` and run `npm install` again

## Deployment

When ready to deploy, follow the Vercel deployment guide in `replit.md`.