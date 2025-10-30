@echo off
echo Starting Ideal Nimko E-commerce Development Environment...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd api && npm start"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Development Server...
start "Frontend Server" cmd /k "cd app && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul
