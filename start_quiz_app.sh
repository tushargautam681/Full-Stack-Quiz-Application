#!/bin/bash

echo "Starting Quiz Application Server..."

# Check if Python is installed
if command -v python3 &>/dev/null; then
    echo "Python3 found. Starting server..."
    python3 serve.py
elif command -v python &>/dev/null; then
    echo "Python found. Starting server..."
    python serve.py
else
    echo "Python not found. Please install Python or use another method to serve the application."
    echo "See README.md for alternative methods."
    exit 1
fi