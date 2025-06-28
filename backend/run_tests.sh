#!/bin/bash

# Mentor-Mentee Backend Test Runner Script
# This script runs all tests for the backend

set -e  # Exit on any error

echo "🧪 Running Mentor-Mentee Backend Tests..."

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

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo "❌ Error: pytest not found. Installing test dependencies..."
    if [ -f "test-requirements.txt" ]; then
        pip install -r test-requirements.txt
    else
        pip install pytest pytest-asyncio httpx
    fi
fi

# Run tests
echo "🚀 Running tests..."
echo "----------------------------------------"

if [ "$1" = "--verbose" ] || [ "$1" = "-v" ]; then
    pytest -v
elif [ "$1" = "--coverage" ] || [ "$1" = "-c" ]; then
    pytest --cov=app --cov-report=html --cov-report=term
else
    pytest
fi

echo "----------------------------------------"
echo "✅ Tests completed!"
