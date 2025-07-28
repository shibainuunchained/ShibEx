import type { Express } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { InsertPosition, insertPositionSchema } from "../shared/schema";
import { marketAPI } from "./market-api";
import { storage } from "./storage";

export function setupRoutes(app: Express) {
  console.log("🔧 Setting up routes...");
  
  // Initialize storage
  storage.initializeDatabase().catch(console.error);
  
  // Basic health check
  app.get("/api/health", (req: any, res: any) => {
    console.log("✅ Health check endpoint hit");
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  console.log("📍 Registered: GET /api/health");

  // Market data
  app.get("/api/market-data", async (req: any, res: any) => {
    try {
      const data = await marketAPI.getLivePrices();
      res.json(data);
    } catch (error) {
      console.error("Market data error:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });
  console.log("📍 Registered: GET /api/market-data");

  // Positions
  app.get("/api/positions/:userId", async (req: any, res: any) => {
    try {
      console.log(`📊 Getting positions for user: ${req.params.userId}`);
      const positions = await storage.getPositions(req.params.userId);
      res.json(positions);
    } catch (error) {
      console.error("Get positions error:", error);
      res.status(500).json({ error: "Failed to get positions" });
    }
  });
  console.log("📍 Registered: GET /api/positions/:userId");

  app.post("/api/positions", async (req: any, res: any) => {
    try {
      console.log("📝 Creating position with data:", req.body);
      const position = insertPositionSchema.parse(req.body);
      const newPosition = await storage.createPosition(position);
      console.log("✅ Position created successfully:", newPosition);
      res.json(newPosition);
    } catch (error) {
      console.error("💥 Create position error:", error);
      res.status(400).json({ error: "Failed to create position", details: error });
    }
  });
  console.log("📍 Registered: POST /api/positions");

  // Orders
  app.get("/api/orders/:userId", async (req: any, res: any) => {
    try {
      console.log(`📋 Getting orders for user: ${req.params.userId}`);
      const orders = await storage.getOrders(req.params.userId);
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ error: "Failed to get orders" });
    }
  });
  console.log("📍 Registered: GET /api/orders/:userId");

  // Trades  
  app.get("/api/trades/:userId", async (req: any, res: any) => {
    try {
      console.log(`💼 Getting trades for user: ${req.params.userId}`);
      const trades = await storage.getTrades(req.params.userId);
      res.json(trades);
    } catch (error) {
      console.error("Get trades error:", error);
      res.status(500).json({ error: "Failed to get trades" });
    }
  });
  console.log("📍 Registered: GET /api/trades/:userId");

  // User balance
  app.get("/api/users/:userId/balance", async (req: any, res: any) => {
    try {
      console.log(`💰 Getting balance for user: ${req.params.userId}`);
      const balance = await storage.getUserBalance(req.params.userId);
      res.json(balance);
    } catch (error) {
      console.error("Get balance error:", error);
      res.status(500).json({ error: "Failed to get balance" });
    }
  });
  console.log("📍 Registered: GET /api/users/:userId/balance");

  // Catch-all for debugging missing routes
  app.use("/api/*", (req: any, res: any) => {
    console.error(`🚨 404 - Route not found: ${req.method} ${req.originalUrl}`);
    console.error("Available routes:");
    console.error("  GET /api/health");
    console.error("  GET /api/market-data");
    console.error("  GET /api/positions/:userId");
    console.error("  POST /api/positions");
    console.error("  GET /api/orders/:userId");
    console.error("  GET /api/trades/:userId");
    console.error("  GET /api/users/:userId/balance");
    res.status(404).json({ 
      error: `Route not found: ${req.method} ${req.originalUrl}`,
      availableRoutes: [
        "GET /api/health",
        "GET /api/market-data", 
        "GET /api/positions/:userId",
        "POST /api/positions",
        "GET /api/orders/:userId",
        "GET /api/trades/:userId",
        "GET /api/users/:userId/balance"
      ]
    });
  });

  console.log("✅ Routes setup complete - All API routes registered");
}