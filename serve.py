#!/usr/bin/env python3
"""
Simple HTTP Server for the Quiz Application

This script starts a simple HTTP server to serve the quiz application.
It can be used if you don't have Node.js installed but have Python.

Usage:
    python serve.py
"""

import http.server
import socketserver
import webbrowser
import os
import sys

# Configuration
PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Change to the directory containing the application
os.chdir(DIRECTORY)

# Create the server
Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    '.js': 'application/javascript',
})

# Start the server
try:
    with socketserver.TCPServer(("localhost", PORT), Handler) as httpd:
        print(f"\nQuiz Application server started at http://localhost:{PORT}/")
        print("Press Ctrl+C to stop the server\n")
        
        # Open the browser automatically
        webbrowser.open(f"http://localhost:{PORT}/")
        
        # Serve until interrupted
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")
    sys.exit(0)
except Exception as e:
    print(f"\nError: {e}")
    sys.exit(1)