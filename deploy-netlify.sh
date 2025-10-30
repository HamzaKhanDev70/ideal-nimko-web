#!/bin/bash

# Ideal Nimko Netlify Deployment Script
echo "🚀 Starting Netlify deployment process..."

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
echo "🔍 Checking Netlify deployment files..."

required_files=(
  "netlify.toml"
  "app/netlify.toml"
  "netlify/functions/health.js"
  "netlify/functions/products.js"
  "netlify/functions/orders.js"
  "netlify/functions/users.js"
  "netlify/functions/admin.js"
  "NETLIFY_DEPLOYMENT.md"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Required file missing: $file"
    exit 1
  fi
done

echo "✅ All required files present"

echo ""
echo "🎉 Ready for Netlify deployment!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub: git push origin main"
echo "2. Go to https://netlify.com"
echo "3. Click 'New site from Git'"
echo "4. Connect to GitHub and select your repository"
echo "5. Configure build settings:"
echo "   - Base directory: app"
echo "   - Build command: npm run build"
echo "   - Publish directory: app/dist"
echo "6. Add environment variables in Netlify dashboard"
echo "7. Deploy!"
echo ""
echo "📚 See NETLIFY_DEPLOYMENT.md for detailed instructions"
