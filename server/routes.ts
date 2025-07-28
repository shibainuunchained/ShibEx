import type { Express } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { InsertPosition, insertPositionSchema } from "../shared/schema";
import { marketAPI } from "./market-api";
import { storage } from "./storage";

export function setupRoutes(app: Express) {
  console.log("Setting up routes...");
  
  // Initialize storage
  storage.initializeDatabase().catch(console.error);
  
  // Basic health check
  app.get("/api/health", (req: any, res: any) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

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

  // Positions
  app.get("/api/positions/:userId", async (req: any, res: any) => {
    try {
      const positions = await storage.getPositions(req.params.userId);
      res.json(positions);
    } catch (error) {
      console.error("Get positions error:", error);
      res.status(500).json({ error: "Failed to get positions" });
    }
  });

  app.post("/api/positions", async (req: any, res: any) => {
    try {
      console.log("Creating position with data:", req.body);
      const position = insertPositionSchema.parse(req.body);
      const newPosition = await storage.createPosition(position);
      console.log("Position created successfully:", newPosition);
      res.json(newPosition);
    } catch (error) {
      console.error("Create position error:", error);
      res.status(400).json({ error: "Failed to create position", details: error });
    }
  });

  // Orders
  app.get("/api/orders/:userId", async (req: any, res: any) => {
    try {
      const orders = await storage.getOrders(req.params.userId);
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ error: "Failed to get orders" });
    }
  });

  // Trades  
  app.get("/api/trades/:userId", async (req: any, res: any) => {
    try {
      const trades = await storage.getTrades(req.params.userId);
      res.json(trades);
    } catch (error) {
      console.error("Get trades error:", error);
      res.status(500).json({ error: "Failed to get trades" });
    }
  });

  // User balance
  app.get("/api/users/:userId/balance", async (req: any, res: any) => {
    try {
      const balance = await storage.getUserBalance(req.params.userId);
      res.json(balance);
    } catch (error) {
      console.error("Get balance error:", error);
      res.status(500).json({ error: "Failed to get balance" });
    }
  });

  console.log("Routes setup complete");
}