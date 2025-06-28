#!/bin/bash

# Stop Frontend Development Server Script

echo "🛑 Stopping Frontend Development Server..."

# Check if PID file exists
if [ -f "frontend.pid" ]; then
    PID=$(cat frontend.pid)
    if kill -0 $PID 2>/dev/null; then
        echo "🔪 Killing process $PID..."
        kill $PID
        rm -f frontend.pid
        echo "✅ Frontend server stopped successfully"
    else
        echo "⚠️  Process $PID not found (already stopped?)"
        rm -f frontend.pid
    fi
else
    echo "⚠️  No PID file found. Attempting to kill any React process on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    echo "✅ Port 3000 cleanup completed"
fi

# Clean up log file if it exists
if [ -f "frontend.log" ]; then
    echo "🧹 Cleaning up log file..."
    rm -f frontend.log
fi

echo "🏁 Frontend shutdown complete"
