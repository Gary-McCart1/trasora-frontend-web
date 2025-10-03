#!/bin/sh

# Fail the script if any command fails
set -e

echo "--- Starting ci_post_clone.sh for Capacitor (Node.js/npm Setup) ---"

# Step 1: Navigate to the root of the repository (CI_WORKSPACE)
# This is the most reliable way to start at the Git root.
cd "${CI_WORKSPACE}"

echo "Current directory: $(pwd)"

# Step 2: Install Node.js (and npm) using Homebrew
echo "Installing Node.js via Homebrew..."
# Homebrew is installed and functional on Xcode Cloud
brew install node

# CRITICAL: Update the PATH to include the newly installed Homebrew executables
# This ensures 'npm' is found.
export PATH="/opt/homebrew/bin:$PATH"

# Step 3: Install Web/Capacitor dependencies
# Assuming your package.json is at the repository root
echo "Installing web dependencies using npm..."
npm install # Now npm should be in the PATH

# Step 4: Navigate to the Podfile directory
# The path to the Podfile is: ios/App/Podfile
echo "Navigating to Podfile directory..."
cd ios/App/

# Confirm the current directory is the Podfile location
echo "Current directory for CocoaPods: $(pwd)"

# Step 5: Run CocoaPods install
# Podfile can now find '../../node_modules' because they exist.
echo "Running pod install..."
/usr/bin/pod install --repo-update

echo "--- Build dependencies ready. Success is near! ---"