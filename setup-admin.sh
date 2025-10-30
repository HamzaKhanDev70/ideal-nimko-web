#!/bin/bash

echo "Setting up Ideal Nimko Admin Panel..."
echo

echo "Installing backend dependencies..."
cd api && npm install
echo

echo "Installing frontend dependencies..."
cd ../app && npm install
echo

echo "Seeding admin data..."
cd ../api && node seedAdmin.js
echo

echo "Seeding product data..."
node seedData.js
echo

echo "Starting backend server..."
cd ../api && npm start &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 5

echo "Starting frontend development server..."
cd ../app && npm run dev &
FRONTEND_PID=$!

echo
echo "========================================"
echo "Admin Panel Setup Complete!"
echo "========================================"
echo
echo "Access Points:"
echo "- Frontend: http://localhost:5173"
echo "- Admin Panel: http://localhost:5173/admin"
echo "- Backend API: http://localhost:5000"
echo
echo "Admin Login Credentials:"
echo "- Email: admin@idealnimko.com"
echo "- Password: admin123"
echo

# Function to cleanup processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
