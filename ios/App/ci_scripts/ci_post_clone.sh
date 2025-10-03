#!/bin/sh

# Fail the script if any command fails
set -e

echo "--- STARTING: Capacitor Setup (Path Verified) ---"

# Step 1: Navigate to the repository root.
# Start: ios/App/ci_scripts
# Target: /Volumes/workspace/repository
cd ../../..

echo "Current directory after navigating to root: $(pwd)"

# --- IMPORTANT ASSUMPTION ---
# Based on your previous errors, the web project folder is named 'frontend-web' 
# AND the Podfile is located at 'frontend-web/ios/App/Podfile'.
# We must move into the 'frontend-web' folder next.
# ----------------------------

# Step 2: Install Node.js (and npm) using Homebrew
echo "Installing Node.js via Homebrew..."
# You already ran this successfully, but leave it in case a new runner is used.
brew install node
# CRITICAL: Update the PATH to include the newly installed Homebrew executables
export PATH="/usr/local/bin:$PATH" # Use /usr/local/bin as Homebrew installed to /usr/local/Cellar
export PATH="/opt/homebrew/bin:$PATH" # Also check the M1 path for safety

# Step 3: Navigate to the directory containing package.json (frontend-web)
echo "Navigating to package.json directory (frontend-web/)..."
cd frontend-web/

echo "Current directory after cd frontend-web/: $(pwd)"

# Step 4: Install Web dependencies
echo "Installing web dependencies using npm..."
# This command runs successfully from the /frontend-web/ directory.
npm install

# Step 5: Navigate to the Podfile directory for pod install
# Path is relative to the current directory (frontend-web/): ios/App/
echo "Navigating to Podfile directory (ios/App/)..."
cd ios/App/

echo "Current directory for CocoaPods: $(pwd)"

# Step 6: Run CocoaPods install
echo "Running pod install..."
/usr/bin/pod install --repo-update

echo "--- POST-CLONE SCRIPT COMPLETE. ---"