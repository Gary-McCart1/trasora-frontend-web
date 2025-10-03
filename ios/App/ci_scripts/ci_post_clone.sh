#!/bin/sh

# Fail the script if any command fails
set -e

echo "--- STARTING: Capacitor Setup (FINAL Path Correction) ---"

# Step 1: Navigate to the repository root.
# Start: ios/App/ci_scripts -> Target: /Volumes/workspace/repository
cd ../../..

echo "Current directory after navigating to root: $(pwd)"

# Step 2: Install Node.js (and npm) using Homebrew
echo "Installing Node.js via Homebrew..."
brew install node
# Update the PATHs for robustness
export PATH="/usr/local/bin:$PATH"
export PATH="/opt/homebrew/bin:$PATH"

# Step 3: Install Web dependencies (Running at root /Volumes/workspace/repository)
echo "Installing web dependencies (npm install at root)..."
npm install
# node_modules will now be created at: /Volumes/workspace/repository/node_modules

# Step 4: Navigate to the Podfile directory for pod install
# Path is relative to the current root directory: ios/App/
echo "Navigating to Podfile directory (ios/App/)..."
cd ios/App/

echo "Current directory for CocoaPods: $(pwd)"

# Step 5: Run CocoaPods install
# The Podfile's relative path '../../node_modules' will now correctly resolve 
# from 'ios/App/' to the root's 'node_modules' folder.
echo "Running pod install..."
/usr/bin/pod install --repo-update

echo "--- POST-CLONE SCRIPT COMPLETE. EXPECT SUCCESS. ---"