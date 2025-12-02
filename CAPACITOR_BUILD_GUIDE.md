# Capacitor Native App Build Guide

This guide explains how to build and distribute the native Android/iOS apps using Capacitor.

## Prerequisites

### For Android:
- Android Studio installed
- Java JDK 8 or higher
- Android SDK

### For iOS (Mac only):
- Xcode installed
- CocoaPods (`sudo gem install cocoapods`)
- Apple Developer account (for distribution)

## Building the App

### Step 1: Build Next.js App

First, build your Next.js application:

```bash
npm run build
```

This creates the `out` directory with static files that Capacitor will use.

### Step 2: Sync with Capacitor

Sync the web assets with native projects:

```bash
npm run cap:sync
```

### Step 3: Build Android APK

#### Option A: Using Android Studio (Recommended)

1. Open Android Studio
2. Open the `android` folder in your project
3. Wait for Gradle sync to complete
4. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
5. Once built, the APK will be at: `android/app/build/outputs/apk/release/app-release.apk`
6. Copy this file to `public/apps/app-release.apk`

#### Option B: Using Command Line

```bash
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

Copy it to `public/apps/app-release.apk`:

```bash
# On Windows PowerShell
Copy-Item android\app\build\outputs\apk\release\app-release.apk public\apps\app-release.apk

# On Mac/Linux
cp android/app/build/outputs/apk/release/app-release.apk public/apps/app-release.apk
```

### Step 4: Build iOS IPA (Mac only)

1. Open Xcode:
   ```bash
   npm run cap:open:ios
   ```

2. In Xcode:
   - Select your development team
   - Go to **Product > Archive**
   - Once archived, click **Distribute App**
   - Choose distribution method (Ad Hoc, App Store, Enterprise)
   - Export the IPA file
   - Copy it to `public/apps/STIS-Conference.ipa`

## Quick Build Script

You can use this script to automate the Android build:

```bash
# Build Next.js
npm run build

# Sync Capacitor
npm run cap:sync

# Build Android APK
cd android
./gradlew assembleRelease
cd ..

# Copy APK to public directory
# Windows:
Copy-Item android\app\build\outputs\apk\release\app-release.apk public\apps\app-release.apk

# Mac/Linux:
cp android/app/build/outputs/apk/release/app-release.apk public/apps/app-release.apk
```

## Distribution

Once the APK/IPA files are in `public/apps/`, users can download them by clicking the "Download as App" button on your website.

### Android Installation

Users will need to:
1. Download the APK
2. Enable "Install from Unknown Sources" in Android settings (if not already enabled)
3. Open the downloaded APK file
4. Tap "Install"

### iOS Installation

For iOS, you have several options:

1. **TestFlight** (Recommended for testing):
   - Upload to App Store Connect
   - Distribute via TestFlight

2. **Enterprise Distribution**:
   - Requires Apple Enterprise Developer account
   - Users install via Settings > General > VPN & Device Management

3. **Ad Hoc Distribution**:
   - Limited to specific device UDIDs
   - Requires device registration

## Updating the App

When you make changes:

1. Update your Next.js app
2. Run `npm run build`
3. Run `npm run cap:sync`
4. Rebuild the native apps
5. Replace the APK/IPA files in `public/apps/`

## Troubleshooting

### "out directory not found"
- Make sure you've run `npm run build` first

### Android build fails
- Make sure Android Studio and SDK are properly installed
- Check that Java JDK is installed and configured

### iOS build fails
- Make sure you're on a Mac
- Verify Xcode and CocoaPods are installed
- Check that your Apple Developer account is configured

## Notes

- The APK/IPA files should be committed to your repository or hosted separately
- For production, consider using a CDN or cloud storage for app distribution
- Android APK size is typically 10-50MB
- iOS IPA size is typically 20-100MB

