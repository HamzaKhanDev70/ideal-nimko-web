#!/bin/bash

echo "🚀 Starting Netlify build process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ package.json not found. Make sure you're in the app directory."
  exit 1
fi

echo "✅ Found package.json"

# Clear any existing node_modules to ensure clean install
echo "🧹 Cleaning previous installations..."
rm -rf node_modules package-lock.json

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Vite is available
echo "🔍 Checking Vite installation..."
if ! npx vite --version > /dev/null 2>&1; then
  echo "❌ Vite not found after npm install"
  echo "📋 Installed packages:"
  npm list --depth=0
  echo "🔍 Trying to find vite..."
  find . -name "vite" -type f 2>/dev/null || echo "Vite not found in filesystem"
  exit 1
fi

echo "✅ Vite found"

# Build the project
echo "🔨 Building project..."
npx vite build

# Check if build was successful
if [ ! -d "dist" ]; then
  echo "❌ Build failed - dist directory not created"
  exit 1
fi

echo "✅ Build completed successfully"
echo "📁 Build output in dist/ directory"
ls -la dist/
