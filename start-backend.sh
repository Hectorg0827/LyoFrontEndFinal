#!/bin/bash
echo "Starting Lyo Backend Server..."
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "Checking server.js exists: $(ls -la server.js)"
echo "Starting server on port 8000..."
node server.js
