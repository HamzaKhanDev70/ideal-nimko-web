#!/bin/bash

echo "🚀 Starting Netlify build process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ package.json not found. Make sure you're in the app directory."
  exit 1
fi

echo "✅ Found package.json"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Vite is available
if ! command -v npx vite &> /dev/null; then
  echo "❌ Vite not found after npm install"
  echo "📋 Installed packages:"
  npm list --depth=0
  exit 1
fi

echo "✅ Vite found"

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
  echo "❌ Build failed - dist directory not created"
  exit 1
fi

echo "✅ Build completed successfully"
echo "📁 Build output in dist/ directory"
