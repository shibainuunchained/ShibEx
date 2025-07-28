import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async () => {
  const plugins: any[] = [react()];

  // Only try to load Replit plugins in development and when on Replit
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID) {
    try {
      const { default: runtimeErrorOverlay } = await import("@replit/vite-plugin-runtime-error-modal");
      plugins.push(runtimeErrorOverlay());
    } catch (error) {
      console.log("Replit runtime error overlay not available");
    }

    try {
      const { cartographer } = await import("@replit/vite-plugin-cartographer");
      plugins.push(cartographer());
    } catch (error) {
      console.log("Replit cartographer not available");
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      hmr: {
        port: 5173,
        host: '0.0.0.0'
      },
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    }
  };
});