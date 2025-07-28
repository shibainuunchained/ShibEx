import express, { type Request, Response, NextFunction } from "express";
import { setupVite } from "./vite";
import { setupRoutes } from "./routes";
import { log } from "./vite";

const app = express();

// Add comprehensive error handling
process.on('uncaughtException', (error) => {
  console.error('🚨 UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

// Minimal middleware setup
app.use((req: any, res: any, next: any) => {
  res.json = function (bodyJson: any, ...args: any[]) {
    return res.type("json").send(JSON.stringify(bodyJson));
  };
  next();
});

app.use(express.json());
app.use(express.static("dist"));

// Setup routes FIRST (this includes /api/health)
try {
  console.log('🔧 Setting up routes...');
  setupRoutes(app);
  console.log('✅ Routes setup complete');
} catch (error) {
  console.error('💥 Routes setup error:', error);
  console.error('Stack:', error?.stack);
}

// Setup Vite AFTER routes
try {
  console.log('🔧 Setting up Vite...');
  setupVite(app);
  console.log('✅ Vite setup complete');
} catch (error) {
  console.error('💥 Vite setup error:', error);
  console.error('Stack:', error?.stack);
}

// BULLETPROOF port configuration
const port = parseInt(process.env.PORT as string) || 10000;
const host = '0.0.0.0';

console.log('🚀 Starting server...');
console.log('📊 Environment PORT:', process.env.PORT);
console.log('🔌 Using port:', port);
console.log('🌐 Using host:', host);
console.log('📁 NODE_ENV:', process.env.NODE_ENV);

const server = app.listen(port, host, () => {
  log(`✅ Server running on http://${host}:${port}`);
  console.log('🎯 Health check available at: /api/health');
  console.log('🛠️ API routes available at: /api/*');
});

// Enhanced error handling for server
server.on('error', (error: any) => {
  console.error('🚨 Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});
