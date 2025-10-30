@echo off
echo 🚀 Starting Netlify deployment process...

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
echo 🔍 Checking Netlify deployment files...

if not exist "netlify.toml" (
    echo ❌ Required file missing: netlify.toml
    exit /b 1
)

if not exist "app\netlify.toml" (
    echo ❌ Required file missing: app\netlify.toml
    exit /b 1
)

if not exist "netlify\functions" (
    echo ❌ Required directory missing: netlify\functions
    exit /b 1
)

echo ✅ All required files present

echo.
echo 🎉 Ready for Netlify deployment!
echo.
echo Next steps:
echo 1. Push your code to GitHub: git push origin main
echo 2. Go to https://netlify.com
echo 3. Click "New site from Git"
echo 4. Connect to GitHub and select your repository
echo 5. Configure build settings:
echo    - Base directory: app
echo    - Build command: npm run build
echo    - Publish directory: app/dist
echo 6. Add environment variables in Netlify dashboard
echo 7. Deploy!
echo.
echo 📚 See NETLIFY_DEPLOYMENT.md for detailed instructions

pause
