#!/bin/bash
# Muay Thai Training App - Smart Development Server Startup
# This script tries multiple strategies to start the development server

echo "🥊 Starting Muay Thai Training App Development Server..."
echo ""

# Strategy 1: Offline mode (recommended for Watchman issues)
echo "Strategy 1: Starting with offline mode (bypasses Watchman)..."
if EXPO_OFFLINE=1 npx expo start --web --clear; then
    echo "✓ Successfully started with offline mode"
    exit 0
fi

echo "✗ Offline mode failed, trying alternative strategies..."

# Strategy 2: Standard mode
echo "Strategy 2: Trying standard startup..."
if npx expo start --web --clear; then
    echo "✓ Successfully started with standard mode"
    exit 0
fi

echo "✗ Standard mode failed, trying tunnel mode..."

# Strategy 3: Tunnel mode (for network issues)
echo "Strategy 3: Trying tunnel mode..."
if npx expo start --tunnel; then
    echo "✓ Successfully started with tunnel mode"
    exit 0
fi

echo "✗ Tunnel mode failed, trying alternative port..."

# Strategy 4: Alternative port
echo "Strategy 4: Trying alternative port (8082)..."
if EXPO_OFFLINE=1 npx expo start --web --port 8082; then
    echo "✓ Successfully started on port 8082"
    exit 0
fi

echo ""
echo "🚨 All startup strategies failed!"
echo "Please run the health check script: ./scripts/health-check.sh"
echo "Or try manual dependency reset:"
echo "  rm -rf node_modules"
echo "  pnpm install"
echo "  EXPO_OFFLINE=1 npx expo start --web --clear"
exit 1