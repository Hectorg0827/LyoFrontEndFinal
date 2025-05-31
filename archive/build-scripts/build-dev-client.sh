#!/usr/bin/env bash
set -e

echo "Building Lyo development client for iOS simulator..."

# Install EAS CLI if needed
if ! command -v eas &> /dev/null; then
  echo "Installing EAS CLI..."
  npm install -g eas-cli
fi

# Create a minimal build profile
cat > eas.json << 'EOL'
{
  "cli": {
    "version": ">= 3.18.3"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
EOL

# Ensure expo-dev-client is installed
yarn add expo-dev-client@~2.2.1 || npm install expo-dev-client@~2.2.1 --save

# Ensure expo-splash-screen is installed
yarn add expo-splash-screen@~0.18.2 || npm install expo-splash-screen@~0.18.2 --save

# Build the development client for iOS simulator
echo "Building development client for simulator..."
eas build --profile development --platform ios --local

echo "Once the build completes, follow the instructions to install the app on your simulator."
echo "Then run 'npx expo start --dev-client' to launch the app."
