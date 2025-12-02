#!/bin/bash
# Shell script to build the Capacitor Android app
# Run this script after making changes to build and prepare the APK for download

echo "Building Next.js app..."
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo "Syncing with Capacitor..."
npm run cap:sync

if [ $? -ne 0 ]; then
    echo "Capacitor sync failed!"
    exit 1
fi

echo ""
echo "Next steps:"
echo "1. Open Android Studio"
echo "2. Open the 'android' folder in this project"
echo "3. Build > Build Bundle(s) / APK(s) > Build APK(s)"
echo "4. Copy the APK from: android/app/build/outputs/apk/release/app-release.apk"
echo "5. Paste it to: public/apps/app-release.apk"
echo ""
echo "Or run: npm run cap:open:android"

