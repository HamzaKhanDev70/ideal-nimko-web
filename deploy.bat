@echo off
echo 🚀 Starting deployment process...

REM Check if git is clean
git status --porcelain >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git working directory is not clean. Please commit or stash your changes first.
    exit /b 1
)

echo ✅ Git working directory is clean

REM Build frontend
echo 📦 Building frontend...
cd app
call npm install
call npm run build
cd ..

echo ✅ Frontend built successfully

REM Check if all required files exist
echo 🔍 Checking deployment files...

if not exist "api\Dockerfile" (
    echo ❌ Required file missing: api\Dockerfile
    exit /b 1
)

if not exist "api\railway.json" (
    echo ❌ Required file missing: api\railway.json
    exit /b 1
)

if not exist "api\nixpacks.toml" (
    echo ❌ Required file missing: api\nixpacks.toml
    exit /b 1
)

if not exist "app\vercel.json" (
    echo ❌ Required file missing: app\vercel.json
    exit /b 1
)

if not exist "DEPLOYMENT.md" (
    echo ❌ Required file missing: DEPLOYMENT.md
    exit /b 1
)

echo ✅ All required files present

echo.
echo 🎉 Ready for deployment!
echo.
echo Next steps:
echo 1. Push your code to GitHub: git push origin main
echo 2. Deploy backend to Railway: https://railway.app
echo 3. Deploy frontend to Vercel: https://vercel.com
echo 4. Follow the DEPLOYMENT.md guide for detailed instructions
echo.
echo 📚 See DEPLOYMENT.md for complete deployment instructions

pause
