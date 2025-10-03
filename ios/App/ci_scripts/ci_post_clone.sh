#!/bin/sh

# Fail the script if any command fails
set -e

echo "--- STARTING PATH DEBUG (Read Log for Directory Contents) ---"

# Step 1: Navigate to the root of the repository (CI_WORKSPACE)
cd "${CI_WORKSPACE}"

echo ">>> DEBUG 1: Current directory is CI_WORKSPACE (Git Root) <<<"
echo "Current path: $(pwd)"
echo "Contents of Git Root:"
ls -F
echo "-------------------------------------------------------------"

# Step 2: Install Node.js
echo "Installing Node.js via Homebrew..."
brew install node
export PATH="/opt/homebrew/bin:$PATH"

# Step 3: Navigate to the directory containing package.json (e.g., frontend-web/)
echo "Navigating to package.json directory..."
# TRY THE ASSUMED PATH AGAIN (based on the previous error's location)
cd frontend-web/

echo ">>> DEBUG 2: Current directory is frontend-web/ <<<"
echo "Current path: $(pwd)"
echo "Contents of frontend-web/:"
ls -F
echo "-------------------------------------------------------------"

# Step 4: Install Web dependencies (This is likely where package.json is)
echo "Installing web dependencies using npm..."
npm install

# Step 5: Navigate to the Podfile directory for pod install
# This path is relative to the current directory (frontend-web/)
echo "Navigating to Podfile directory..."
cd ios/App/

echo ">>> DEBUG 3: Current directory is ios/App/ (Podfile location) <<<"
echo "Current path: $(pwd)"
echo "Contents of ios/App/ (Should contain Podfile and ci_scripts/):"
ls -F
echo "-------------------------------------------------------------"

# Step 6: Run CocoaPods install
echo "Running pod install..."
/usr/bin/pod install --repo-update

echo "--- DEBUG COMPLETE. Check Logs Carefully. ---"