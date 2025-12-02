const fs = require('fs');
const path = require('path');

// Create out directory structure
const outDir = path.join(process.cwd(), 'out');
const nextStaticDir = path.join(process.cwd(), '.next', 'static');
const publicDir = path.join(process.cwd(), 'public');

// Create out directory
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Copy static files from .next/static
if (fs.existsSync(nextStaticDir)) {
  const outStaticDir = path.join(outDir, '_next', 'static');
  if (!fs.existsSync(outStaticDir)) {
    fs.mkdirSync(outStaticDir, { recursive: true });
  }
  
  // Copy static chunks
  copyRecursiveSync(nextStaticDir, outStaticDir);
}

// Copy public files
if (fs.existsSync(publicDir)) {
  const publicFiles = fs.readdirSync(publicDir);
  publicFiles.forEach(file => {
    const srcPath = path.join(publicDir, file);
    const destPath = path.join(outDir, file);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Create a basic index.html that loads from the server
// For Capacitor, we'll configure it to use the production server URL
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>STIS Conference</title>
  <script>
    // Redirect to production server
    // This will be overridden by Capacitor config if server.url is set
    if (!window.Capacitor) {
      window.location.href = '${process.env.NEXT_PUBLIC_API_URL || 'https://your-production-url.com'}';
    }
  </script>
</head>
<body>
  <div id="__next"></div>
  <script src="/_next/static/chunks/main.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);

console.log('✅ Capacitor build directory prepared at:', outDir);
console.log('⚠️  Note: API routes will be served from your production server');
console.log('   Make sure to set server.url in capacitor.config.ts for production');

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

