#!/bin/sh

# Fail the script if any command fails
set -e

echo "--- Starting ci_post_clone.sh for Capacitor ---"

# The script runs from the ci_scripts folder (e.g., CI_WORKSPACE/frontend-web/ios/App/ci_scripts).
# We navigate UP one level to the Podfile directory (e.g., CI_WORKSPACE/frontend-web/ios/App).
cd .. 

# Confirm the working directory is correct (should be the directory containing your Podfile)
echo "Current directory after navigation: $(pwd)"

# Run CocoaPods install
echo "Running pod install..."
pod install --repo-update

echo "--- CocoaPods installation complete. Generating .xcconfig file. ---"