#!/bin/bash

# Mentor-Mentee Backend Server Startup Script
# This script starts the FastAPI backend server

set -e  # Exit on any error

echo "🚀 Starting Mentor-Mentee Backend Server..."

# Check if we're in the backend directory
if [ ! -f "main.py" ]; then
    echo "❌ Error: main.py not found. Please run this script from the backend directory."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Error: Virtual environment not found. Please run setup.sh first."
    exit 1
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Check if uvicorn is installed
if ! command -v uvicorn &> /dev/null; then
    echo "❌ Error: uvicorn not found. Installing dependencies..."
    pip install -r requirements.txt
fi

# Start the server
echo "🌟 Starting FastAPI server on http://localhost:8080"
echo "📚 API Documentation: http://localhost:8080/docs"
echo "📖 Alternative Docs: http://localhost:8080/redoc"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

uvicorn main:app --host 0.0.0.0 --port 8080 --reload &
