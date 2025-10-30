#!/bin/bash

# Ideal Nimko Deployment Script
echo "🚀 Starting deployment process..."

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Git working directory is not clean. Please commit or stash your changes first."
  exit 1
fi

echo "✅ Git working directory is clean"

# Build frontend
echo "📦 Building frontend..."
cd app
npm install
npm run build
cd ..

echo "✅ Frontend built successfully"

# Check if all required files exist
echo "🔍 Checking deployment files..."

required_files=(
  "api/Dockerfile"
  "api/railway.json"
  "api/nixpacks.toml"
  "app/vercel.json"
  "DEPLOYMENT.md"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Required file missing: $file"
    exit 1
  fi
done

echo "✅ All required files present"

echo ""
echo "🎉 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub: git push origin main"
echo "2. Deploy backend to Railway: https://railway.app"
echo "3. Deploy frontend to Vercel: https://vercel.com"
echo "4. Follow the DEPLOYMENT.md guide for detailed instructions"
echo ""
echo "📚 See DEPLOYMENT.md for complete deployment instructions"
