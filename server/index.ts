import express, { type Request, Response, NextFunction } from "express";
import { setupVite } from "./vite";
import { setupRoutes } from "./routes";
import { log } from "./vite";

const app = express();

// Minimal middleware setup
app.use((req: any, res: any, next: any) => {
  res.json = function (bodyJson: any, ...args: any[]) {
    return res.type("json").send(JSON.stringify(bodyJson));
  };
  next();
});

app.use(express.json());
app.use(express.static("dist"));

// Setup routes and Vite
try {
  setupRoutes(app);
  setupVite(app);
} catch (error) {
  console.error("Setup error:", error);
}

// BULLETPROOF port configuration
const port = parseInt(process.env.PORT as string) || 10000;
const host = '0.0.0.0';

console.log('Starting server...');
console.log('Environment PORT:', process.env.PORT);
console.log('Using port:', port);
console.log('Using host:', host);

const server = app.listen(port, host, () => {
  log(`🚀 Server running on http://${host}:${port}`);
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
