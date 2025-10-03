#!/bin/sh

# Fail the script if any command fails
set -e

echo "--- Starting ci_post_clone.sh for Capacitor (Final Attempt) ---"

# Step 1: Navigate to the root of the repository (trasora/)
# The script runs from: CI_WORKSPACE/frontend-web/ios/App/ci_scripts
# Go up 3 levels: ci_scripts -> App -> ios -> frontend-web -> CI_WORKSPACE (root)
cd "$(dirname "$0")"/../../.. 

# Confirm the working directory is the repository root
echo "Current directory for web dependencies: $(pwd)"

# Step 2: Install Web/Capacitor dependencies
# Assuming your package.json (with Capacitor dependencies) is in 'frontend-web/'
echo "Installing web dependencies..."
cd frontend-web/

# USE THE COMMAND YOU NORMALLY USE TO INSTALL WEB DEPENDENCIES
# Choose EITHER 'npm' OR 'yarn'
# npm install
yarn install --frozen-lockfile # Use --frozen-lockfile for CI safety

# Step 3: Navigate to the Podfile directory for pod install
echo "Navigating to Podfile directory..."
cd ios/App/

# Confirm the current directory is the Podfile location
echo "Current directory for CocoaPods: $(pwd)"

# Step 4: Run CocoaPods install
# The podfile can now correctly find '../../node_modules' because the modules exist
echo "Running pod install..."
/usr/bin/pod install --repo-update

echo "--- Build dependencies ready. ---"