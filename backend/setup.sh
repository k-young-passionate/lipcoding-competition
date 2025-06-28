#!/bin/bash

# Mentor-Mentee Backend Setup Script
# This script sets up the Python environment and installs dependencies

set -e  # Exit on any error

echo "🔧 Setting up Mentor-Mentee Backend..."

# Check if we're in the backend directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: requirements.txt not found. Please run this script from the backend directory."
    exit 1
fi

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
required_version="3.12"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Error: Python 3.12 or higher is required. Current version: $python_version"
    exit 1
fi

echo "✅ Python version: $python_version"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Install test dependencies if they exist
if [ -f "test-requirements.txt" ]; then
    echo "🧪 Installing test dependencies..."
    pip install -r test-requirements.txt
fi

# Create database (if needed)
echo "🗄️ Setting up database..."
if [ -f "alembic.ini" ]; then
    echo "Running database migrations..."
    alembic upgrade head
else
    echo "No Alembic configuration found, database will be created automatically."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the server, run:"
echo "  ./start_server.sh"
echo ""
echo "Or manually:"
echo "  source venv/bin/activate"
echo "  uvicorn main:app --host 0.0.0.0 --port 8080 --reload"
