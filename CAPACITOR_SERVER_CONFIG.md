# Capacitor Server Configuration

Since your app uses Next.js API routes, you need to configure Capacitor to point to your production server for API calls.

## Configuration Options

### Option 1: Use Production Server (Recommended)

Edit `capacitor.config.ts` and set the server URL:

```typescript
server: {
  url: 'https://your-production-url.com',  // Your deployed Next.js server
  cleartext: false  // Set to true only for HTTP (not recommended)
}
```

This way:
- The app UI is bundled in the native app
- API calls go to your production server
- You can update the server without rebuilding the app

### Option 2: Local Development

For testing with local server:

```typescript
server: {
  url: 'http://localhost:3000',  // Your local Next.js server
  cleartext: true  // Required for HTTP (localhost only)
}
```

**Note:** For Android, you may need to use `http://10.0.2.2:3000` instead of `localhost` when testing on an emulator.

### Option 3: No Server URL (Static Only)

If you comment out the server URL, the app will try to use bundled files only. This won't work if you have API routes.

## Environment Variables

You can use environment variables:

```typescript
server: {
  url: process.env.CAPACITOR_SERVER_URL || 'https://your-production-url.com',
  cleartext: false
}
```

Then set `CAPACITOR_SERVER_URL` in your `.env` file.

## After Changing Config

After updating `capacitor.config.ts`, run:

```bash
npm run cap:sync
```

This will update the native projects with the new configuration.

