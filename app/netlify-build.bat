@echo off
echo 🚀 Starting Netlify build process...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found. Make sure you're in the app directory.
    exit /b 1
)

echo ✅ Found package.json

REM Clear any existing node_modules to ensure clean install
echo 🧹 Cleaning previous installations...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del "package-lock.json"

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Check if Vite is available
echo 🔍 Checking Vite installation...
npx vite --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vite not found after npm install
    echo 📋 Installed packages:
    npm list --depth=0
    exit /b 1
)

echo ✅ Vite found

REM Build the project
echo 🔨 Building project...
call npx vite build

REM Check if build was successful
if not exist "dist" (
    echo ❌ Build failed - dist directory not created
    exit /b 1
)

echo ✅ Build completed successfully
echo 📁 Build output in dist/ directory
dir dist
