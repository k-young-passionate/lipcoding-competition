#!/bin/bash

# Mentor-Mentee Frontend Development Server Startup Script
# This script starts the React development server

set -e  # Exit on any error

echo "🚀 Starting Mentor-Mentee Frontend Development Server..."

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version $NODE_VERSION detected. Recommended: Node.js 18+ (LTS 22.x preferred)"
fi

# Kill any existing process on port 3000 to ensure clean start
echo "🔧 Cleaning up any existing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Wait a moment for processes to fully terminate
sleep 2

# Force port 3000 for testing compatibility
PORT=3000

# Start the development server
echo "🌟 Starting React development server on http://localhost:$PORT"
echo "📱 Mobile access: http://$(ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $1}'):$PORT"
echo "🔧 Development build (not optimized for production)"
echo "🧪 Running on port 3000 for Playwright tests compatibility"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

# Export port and start the server in background
export PORT=$PORT

# Start the server in background and save PID
npm start > frontend.log 2>&1 &
SERVER_PID=$!

# Save PID to file for later cleanup
echo $SERVER_PID > frontend.pid

echo "✅ Frontend server started in background (PID: $SERVER_PID)"
echo "📄 Logs are being written to frontend.log"
echo "🛑 To stop the server, run: kill \$(cat frontend.pid)"
echo ""
echo "Server is ready! Check http://localhost:$PORT"
