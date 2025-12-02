# PowerShell script to build the Capacitor Android app
# Run this script after making changes to build and prepare the APK for download

Write-Host "Building Next.js app..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Syncing with Capacitor..." -ForegroundColor Green
npm run cap:sync

if ($LASTEXITCODE -ne 0) {
    Write-Host "Capacitor sync failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Open Android Studio" -ForegroundColor Cyan
Write-Host "2. Open the 'android' folder in this project" -ForegroundColor Cyan
Write-Host "3. Build > Build Bundle(s) / APK(s) > Build APK(s)" -ForegroundColor Cyan
Write-Host "4. After building, run: npm run cap:copy-apk" -ForegroundColor Green
Write-Host "`nOr run: npm run cap:open:android" -ForegroundColor Green

