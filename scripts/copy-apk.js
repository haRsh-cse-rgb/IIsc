const fs = require('fs');
const path = require('path');

// Check for both release and debug APKs
const releaseApk = path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
const debugApk = path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

const apkDest = path.join(process.cwd(), 'public', 'apps', 'app-release.apk');
const appsDir = path.join(process.cwd(), 'public', 'apps');

// Determine which APK to use (prefer release, fallback to debug)
let apkSource;
let apkType;

if (fs.existsSync(releaseApk)) {
  apkSource = releaseApk;
  apkType = 'release';
} else if (fs.existsSync(debugApk)) {
  apkSource = debugApk;
  apkType = 'debug';
  console.log('⚠️  Using DEBUG APK (not recommended for production)');
  console.log('   For production, build a RELEASE APK:');
  console.log('   Build > Generate Signed Bundle / APK > APK > Release');
} else {
  console.error('❌ APK not found!');
  console.error('   Checked:', releaseApk);
  console.error('   Checked:', debugApk);
  console.error('\nPlease build the APK first:');
  console.error('1. Open Android Studio');
  console.error('2. Open the android folder');
  console.error('3. Build > Build Bundle(s) / APK(s) > Build APK(s)');
  console.error('\nFor production, use: Build > Generate Signed Bundle / APK > APK > Release');
  process.exit(1);
}

// Ensure destination directory exists
if (!fs.existsSync(appsDir)) {
  fs.mkdirSync(appsDir, { recursive: true });
}

// Copy APK
try {
  fs.copyFileSync(apkSource, apkDest);
  const stats = fs.statSync(apkDest);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log('✅ APK copied successfully!');
  console.log('   Type:', apkType.toUpperCase());
  console.log('   From:', apkSource);
  console.log('   To:', apkDest);
  console.log('   Size:', fileSizeInMB, 'MB');
  if (apkType === 'debug') {
    console.log('\n⚠️  Note: This is a DEBUG APK');
    console.log('   For production, build a RELEASE APK with signing.');
  }
  console.log('\n🎉 Your app is now ready for download!');
  console.log('   Users can click "Download as App" button to get the APK.');
} catch (error) {
  console.error('❌ Failed to copy APK:', error.message);
  process.exit(1);
}

