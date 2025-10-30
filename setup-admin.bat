@echo off
echo Setting up Ideal Nimko Admin Panel...
echo.

echo Installing backend dependencies...
cd api
npm install
echo.

echo Installing frontend dependencies...
cd ../app
npm install
echo.

echo Seeding admin data...
cd ../api
node seedAdmin.js
echo.

echo Seeding product data...
node seedData.js
echo.

echo Starting backend server...
start "Backend Server" cmd /k "cd api && npm start"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting frontend development server...
start "Frontend Server" cmd /k "cd app && npm run dev"

echo.
echo ========================================
echo Admin Panel Setup Complete!
echo ========================================
echo.
echo Access Points:
echo - Frontend: http://localhost:5173
echo - Admin Panel: http://localhost:5173/admin
echo - Backend API: http://localhost:5000
echo.
echo Admin Login Credentials:
echo - Email: admin@idealnimko.com
echo - Password: admin123
echo.
echo Press any key to exit...
pause > nul
