#!/bin/bash

# Quick Frontend Start Script
# Simple script to start React development server

echo "🚀 Starting Frontend..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run from frontend directory"
    exit 1
fi

# Install dependencies if needed
[ ! -d "node_modules" ] && npm install

# Kill any existing process on port 3000/3001
lsof -ti:3000 | xargs kill -9 2>/dev/null || true


# Start server
echo "🌟 http://localhost:3000"
PORT=3000 npm start
