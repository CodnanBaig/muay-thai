#!/bin/bash
# Muay Thai Training App - Development Health Check Script
# This script diagnoses and fixes common development issues

echo "=== Muay Thai Training App - Development Health Check ==="
echo "Date: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check Node.js version
echo "1. Node.js Environment"
NODE_VERSION=$(node --version 2>/dev/null)
if [ $? -eq 0 ]; then
    print_status 0 "Node.js: $NODE_VERSION"
else
    print_status 1 "Node.js: Not installed"
fi

# Check package manager
echo ""
echo "2. Package Management"
if [ -f "package-lock.json" ] && [ -f "pnpm-lock.yaml" ]; then
    print_warning "Multiple lock files detected (npm & pnpm)"
    echo "  Recommendation: Use single package manager (pnpm preferred)"
elif [ -f "pnpm-lock.yaml" ]; then
    print_status 0 "Package manager: pnpm (consistent)"
elif [ -f "package-lock.json" ]; then
    print_status 0 "Package manager: npm (consistent)"
else
    print_status 1 "No lock files found"
fi

# Check critical config files
echo ""
echo "3. Configuration Files"
if [ -f "metro.config.js" ]; then
    print_status 0 "Metro config: Present"
else
    print_status 1 "Metro config: Missing"
fi

if [ -f "babel.config.js" ]; then
    print_status 0 "Babel config: Present"
else
    print_status 1 "Babel config: Missing"
fi

if [ -f "tailwind.config.js" ]; then
    print_status 0 "Tailwind config: Present"
else
    print_status 1 "Tailwind config: Missing"
fi

# Check Watchman status
echo ""
echo "4. Watchman Service"
WATCHMAN_VERSION=$(watchman version 2>/dev/null | head -1)
if [ $? -eq 0 ]; then
    print_status 0 "Watchman: Running ($WATCHMAN_VERSION)"
else
    print_status 1 "Watchman: Not running (will use offline mode)"
fi

# Check port availability
echo ""
echo "5. Development Ports"
PORT_8081=$(lsof -ti:8081 2>/dev/null)
if [ -n "$PORT_8081" ]; then
    print_status 0 "Port 8081: In use (development server running)"
else
    print_status 0 "Port 8081: Available"
fi

# Check node_modules
echo ""
echo "6. Dependencies"
if [ -d "node_modules" ]; then
    MODULES_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
    print_status 0 "Dependencies: Installed ($MODULES_COUNT packages)"
else
    print_status 1 "Dependencies: Not installed"
fi

# Health Summary
echo ""
echo "=== Troubleshooting Commands ==="
echo ""
echo "If experiencing Watchman issues:"
echo "  EXPO_OFFLINE=1 npx expo start --web --clear"
echo ""
echo "For complete dependency reset:"
echo "  rm -rf node_modules && pnpm install"
echo ""
echo "For port conflicts:"
echo "  npx expo start --port 8082"
echo ""
echo "For tunnel mode (network issues):"
echo "  npx expo start --tunnel"
echo ""

echo "=== Recommended Development Command ==="
echo "EXPO_OFFLINE=1 npx expo start --web --clear"
echo ""
echo "=== Health Check Complete ==="