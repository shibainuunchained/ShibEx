import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server?: Server) {
  const isProduction = process.env.NODE_ENV === "production";
  
  console.log(`🔧 Setting up Vite - Mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  
  if (isProduction) {
    // Production: Serve built static files
    console.log("📦 Production mode: Serving static files from dist/");
    
    // Serve the built HTML file for all routes
    app.get("*", (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return next();
      }
      
      try {
        const htmlPath = path.resolve(import.meta.dirname, "..", "dist", "index.html");
        console.log(`📄 Serving HTML from: ${htmlPath}`);
        
        if (fs.existsSync(htmlPath)) {
          const html = fs.readFileSync(htmlPath, "utf-8");
          res.status(200).set({ "Content-Type": "text/html" }).send(html);
        } else {
          console.error(`❌ HTML file not found: ${htmlPath}`);
          res.status(404).send("Application not found");
        }
      } catch (error) {
        console.error("💥 Error serving HTML:", error);
        res.status(500).send("Internal server error");
      }
    });
    
    return;
  }

  // Development: Use Vite dev server
  console.log("🚀 Development mode: Using Vite dev server");
  
  const serverOptions = {
    middlewareMode: true,
    hmr: server ? { server } : false,
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    ...serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const staticPath = path.resolve(import.meta.dirname, "..", "dist");
  console.log(`📁 Serving static files from: ${staticPath}`);
  
  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
    console.log("✅ Static files middleware added");
  } else {
    console.error(`❌ Static directory not found: ${staticPath}`);
  }
}