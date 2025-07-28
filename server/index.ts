import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize memory storage with sample data
  await initializeDatabase();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  
  // Debug port environment variable
  console.log('Environment PORT:', process.env.PORT);
  console.log('All environment variables:', Object.keys(process.env).filter(key => key.includes('PORT')));
  
  // Try multiple port sources and handle Render's specific format
  let portEnv = process.env.PORT || process.env.port || process.env.HTTP_PORT;
  
  // Handle Render's "(auto-assigned by Render)" format
  if (portEnv && (portEnv.includes('auto-assigned') || portEnv.includes('Render'))) {
    portEnv = '10000'; // Use default for Render
  }
  
  let port = parseInt(portEnv || '10000', 10);
  
  // Fallback to 10000 if parsing fails (common Render default)
  if (isNaN(port) || port <= 0 || port >= 65536) {
    console.warn(`Invalid port from env: ${portEnv}, using fallback 10000`);
    port = 10000;
  }
  
  console.log('Final port:', port);
  
  // Use 0.0.0.0 for production environment
  const host = '0.0.0.0';
    
  server.listen(port, host, () => {
    log(`serving on http://${host}:${port}`);
  });
})();
