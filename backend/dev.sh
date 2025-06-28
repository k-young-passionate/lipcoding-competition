#!/bin/bash

# Mentor-Mentee Backend Development Helper Script
# This script provides various development commands

show_help() {
    echo "Mentor-Mentee Backend Development Helper"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup       Set up the development environment"
    echo "  start       Start the development server"
    echo "  test        Run all tests"
    echo "  test-v      Run tests with verbose output"
    echo "  test-cov    Run tests with coverage report"
    echo "  clean       Clean up temporary files"
    echo "  install     Install/update dependencies"
    echo "  shell       Activate virtual environment shell"
    echo "  status      Show server status"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh setup      # First time setup"
    echo "  ./dev.sh start      # Start server"
    echo "  ./dev.sh test       # Run tests"
}

setup_env() {
    echo "🔧 Setting up development environment..."
    ./setup.sh
}

start_server() {
    echo "🚀 Starting development server..."
    ./start_server.sh
}

run_tests() {
    echo "🧪 Running tests..."
    case "$1" in
        "-v"|"--verbose") ./run_tests.sh --verbose ;;
        "-c"|"--coverage") ./run_tests.sh --coverage ;;
        *) ./run_tests.sh ;;
    esac
}

clean_files() {
    echo "🧹 Cleaning up temporary files..."
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
    find . -type f -name "*.pyo" -delete 2>/dev/null || true
    find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
    rm -rf .pytest_cache 2>/dev/null || true
    rm -rf htmlcov 2>/dev/null || true
    echo "✅ Cleanup complete!"
}

install_deps() {
    echo "📦 Installing/updating dependencies..."
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    if [ -f "test-requirements.txt" ]; then
        pip install -r test-requirements.txt
    fi
    echo "✅ Dependencies updated!"
}

activate_shell() {
    echo "🐚 Activating virtual environment..."
    echo "Run 'deactivate' to exit the virtual environment."
    source venv/bin/activate
    exec bash
}

check_status() {
    echo "📊 Backend Server Status:"
    echo "----------------------------------------"
    
    # Check if server is running on port 8080
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "✅ Server is running on http://localhost:8080"
        echo "📚 API Docs: http://localhost:8080/docs"
        echo "📖 ReDoc: http://localhost:8080/redoc"
        
        # Get process info
        process_info=$(lsof -Pi :8080 -sTCP:LISTEN)
        echo ""
        echo "Process Info:"
        echo "$process_info"
    else
        echo "❌ Server is not running"
        echo ""
        echo "To start the server:"
        echo "  ./dev.sh start"
    fi
    
    echo ""
    echo "Environment Info:"
    if [ -d "venv" ]; then
        echo "✅ Virtual environment: exists"
        if [ -n "$VIRTUAL_ENV" ]; then
            echo "✅ Virtual environment: activated"
        else
            echo "❌ Virtual environment: not activated"
        fi
    else
        echo "❌ Virtual environment: not found"
    fi
}

# Main script logic
case "$1" in
    "setup")
        setup_env
        ;;
    "start")
        start_server
        ;;
    "test")
        run_tests "$2"
        ;;
    "test-v")
        run_tests "--verbose"
        ;;
    "test-cov")
        run_tests "--coverage"
        ;;
    "clean")
        clean_files
        ;;
    "install")
        install_deps
        ;;
    "shell")
        activate_shell
        ;;
    "status")
        check_status
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
