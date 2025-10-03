#!/bin/sh

# Fail the script if any command fails
set -e

echo "--- Starting ci_post_clone.sh for Capacitor (Final Corrected Attempt) ---"

# Step 1: Navigate to the root of the repository (CI_WORKSPACE)
# Go up 3 levels: ci_scripts -> App -> ios -> CI_WORKSPACE (root)
# NOTE: Removed one '..' compared to the previous script, as 'ios' is likely a child of the root.
cd "$(dirname "$0")"/../..
# Let's verify this pathing is correct by using the log output.
# If 'ios' is the second level, we only need to go up two.

# Let's use the safer root navigation from the error log:
# Script starts in: /Volumes/workspace/repository/ios/App/ci_scripts
# To reach root: /Volumes/workspace/repository

cd "${CI_WORKSPACE}"

# Confirm the working directory is the repository root
echo "Current directory for web dependencies: $(pwd)"

# Step 2: Install Web/Capacitor dependencies
# Assuming your package.json is at the repository root (based on the previous error)
echo "Installing web dependencies..."

# USE THE COMMAND YOU NORMALLY USE TO INSTALL WEB DEPENDENCIES
# Choose EITHER 'npm' OR 'yarn'
# npm install
/usr/bin/npm install # Using absolute path for robustness

# Step 3: Navigate to the Podfile directory for pod install
# The path to the Podfile is: ios/App/Podfile
echo "Navigating to Podfile directory..."
cd ios/App/

# Confirm the current directory is the Podfile location
echo "Current directory for CocoaPods: $(pwd)"

# Step 4: Run CocoaPods install
# The Podfile can now correctly find '../../node_modules' because the modules exist
echo "Running pod install..."
/usr/bin/pod install --repo-update

echo "--- Build dependencies ready. ---"