#!/bin/bash
set -e

echo "🔧 Installing dependencies..."
npm ci

echo "🏗️ Building application..."
NODE_ENV=production npx vite build

echo "📦 Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

echo "🧹 Cleaning up banners..."
node remove-banner.js

echo "✅ Build complete!"