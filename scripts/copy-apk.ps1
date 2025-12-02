# PowerShell script to copy APK after building in Android Studio

$releaseApk = "android\app\build\outputs\apk\release\app-release.apk"
$debugApk = "android\app\build\outputs\apk\debug\app-debug.apk"
$apkDest = "public\apps\app-release.apk"

# Determine which APK to use (prefer release, fallback to debug)
$apkSource = $null
$apkType = $null

if (Test-Path $releaseApk) {
    $apkSource = $releaseApk
    $apkType = "release"
} elseif (Test-Path $debugApk) {
    $apkSource = $debugApk
    $apkType = "debug"
    Write-Host "⚠️  Using DEBUG APK (not recommended for production)" -ForegroundColor Yellow
    Write-Host "   For production, build a RELEASE APK:" -ForegroundColor Yellow
    Write-Host "   Build > Generate Signed Bundle / APK > APK > Release" -ForegroundColor Cyan
} else {
    Write-Host "❌ APK not found!" -ForegroundColor Red
    Write-Host "   Checked: $releaseApk" -ForegroundColor Gray
    Write-Host "   Checked: $debugApk" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Please build the APK first:" -ForegroundColor Yellow
    Write-Host "1. Open Android Studio" -ForegroundColor Cyan
    Write-Host "2. Open the android folder" -ForegroundColor Cyan
    Write-Host "3. Build > Build Bundle(s) / APK(s) > Build APK(s)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "For production, use: Build > Generate Signed Bundle / APK > APK > Release" -ForegroundColor Cyan
    exit 1
}

# Ensure destination directory exists
$appsDir = "public\apps"
if (-not (Test-Path $appsDir)) {
    New-Item -ItemType Directory -Path $appsDir -Force | Out-Null
}

# Copy APK
try {
    Copy-Item -Path $apkSource -Destination $apkDest -Force
    $fileSize = (Get-Item $apkDest).Length / 1MB
    $fileSizeMB = [math]::Round($fileSize, 2)
    
    Write-Host "✅ APK copied successfully!" -ForegroundColor Green
    Write-Host "   Type: $($apkType.ToUpper())" -ForegroundColor Gray
    Write-Host "   From: $apkSource" -ForegroundColor Gray
    Write-Host "   To: $apkDest" -ForegroundColor Gray
    Write-Host "   Size: $fileSizeMB MB" -ForegroundColor Gray
    if ($apkType -eq "debug") {
        Write-Host ""
        Write-Host "⚠️  Note: This is a DEBUG APK" -ForegroundColor Yellow
        Write-Host "   For production, build a RELEASE APK with signing." -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "🎉 Your app is now ready for download!" -ForegroundColor Green
    Write-Host "   Users can click 'Download as App' button to get the APK." -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to copy APK: $_" -ForegroundColor Red
    exit 1
}

