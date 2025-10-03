#!/bin/sh

# Fail the script if any command fails
set -e

echo "--- STARTING: Capacitor Setup (FINAL Path Correction) ---"

# Step 1: Navigate to the repository root.
cd ../../..
echo "Current directory after navigating to root: $(pwd)"

# Step 2: Install Node.js (and npm) using Homebrew if not already installed
if ! command -v node >/dev/null 2>&1; then
    echo "Node.js not found. Installing via Homebrew..."
    brew install node
else
    echo "Node.js already installed. Version: $(node -v)"
fi

# Update PATH for robustness
export PATH="/usr/local/bin:$PATH"
export PATH="/opt/homebrew/bin:$PATH"

# Step 3: Install Web dependencies
echo "Installing web dependencies (npm install at root)..."
npm install

# Step 3a: Build the web app (so Capacitor has www/ assets)
echo "Building web app..."
npm run build

# Step 3b: Copy web assets into iOS project
echo "Syncing Capacitor iOS project..."
npx cap sync ios

# Step 4: Navigate to the Podfile directory for pod install
cd ios/App/
echo "Current directory for CocoaPods: $(pwd)"

# Step 5: Install CocoaPods if not installed
if ! command -v pod >/dev/null 2>&1; then
    echo "CocoaPods not found. Installing via Homebrew..."
    brew install cocoapods
else
    echo "CocoaPods already installed. Version: $(pod --version)"
fi

# Step 6: Run pod install
echo "Running pod install..."
pod install --repo-update

echo "--- POST-CLONE SCRIPT COMPLETE. EXPECT SUCCESS. ---"
