# Railway Socket.IO Server Deployment Guide

## What to Deploy to Railway

You only need to deploy the **Socket.IO server part**, not the full Next.js application.

### Files Needed for Railway:

1. **`socket-server.js`** - The standalone Socket.IO server
2. **`package.json`** - Dependencies (only needs `socket.io` and `express`)
3. **`.env`** or Railway environment variables

### Files NOT Needed:
- ❌ `server.js` (Next.js server - stays on Vercel)
- ❌ `app/` directory (Next.js pages - stays on Vercel)
- ❌ `src/` directory (React components - stays on Vercel)
- ❌ `next.config.js` (Next.js config - stays on Vercel)

## Step-by-Step Railway Deployment

### 1. Create Minimal Package.json for Socket Server

I've already created `socket-server/package.json` for you. It only needs:

```json
{
  "name": "stis-socket-server",
  "version": "1.0.0",
  "main": "socket-server.js",
  "scripts": {
    "start": "node socket-server.js"
  },
  "dependencies": {
    "socket.io": "^4.8.1"
  }
}
```

**Note**: No Express needed! The socket server uses Node.js built-in `http` module.

### 2. Deploy to Railway

**Option A: Deploy from GitHub (Recommended)**

1. I've created `socket-server/` folder with `package.json` already
2. Copy `socket-server.js` to the `socket-server/` folder:
   ```bash
   cp socket-server.js socket-server/
   ```
3. On Railway:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Set **Root Directory** to `socket-server/`
   - Railway will auto-detect `package.json` and use `npm start`

**Option B: Deploy from Local Directory**

1. Create a new folder: `socket-server/`
2. Copy `socket-server.js` and `package.json` there
3. On Railway:
   - Click "New Project"
   - Select "Deploy from local directory"
   - Upload the `socket-server/` folder

### 3. Configure Environment Variables on Railway

Add these environment variables in Railway dashboard:

```env
PORT=3001
ALLOWED_ORIGIN=https://your-vercel-app.vercel.app
```

**Important**: Replace `your-vercel-app.vercel.app` with your actual Vercel domain.

If you have multiple domains (e.g., production and preview), use comma-separated:
```env
ALLOWED_ORIGIN=https://your-app.vercel.app,https://your-app-git-main.vercel.app
```

### 4. Get Railway URL

After deployment, Railway will give you a URL like:
```
https://your-socket-server.up.railway.app
```

Copy this URL - you'll need it for Vercel configuration.

## Update Vercel Configuration

### 1. Add Environment Variable to Vercel

In your Vercel project settings, add:

```env
SOCKET_SERVER_URL=https://your-socket-server.up.railway.app
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.up.railway.app
```

### 2. Update API Routes to Use Remote Socket Server

The API routes already use `getSocketIO()` which will return `null` on Vercel. We need to update them to use the HTTP endpoint instead.

Update your API routes to use the new `emitSocketEvent` function:

**Example: `app/api/announcements/route.ts`**

```typescript
import { emitSocketEvent } from '@/lib/server/socket';

// In your POST handler:
const io = getSocketIO();
if (io) {
  // Local development - use Socket.IO directly
  io.emit('announcement:new', plainAnnouncement);
} else {
  // Production/Vercel - use HTTP endpoint
  await emitSocketEvent('announcement:new', plainAnnouncement);
}
```

Actually, the `emitSocketEvent` function I created already handles both cases! So you can just replace:

```typescript
const io = getSocketIO();
if (io) {
  io.emit('announcement:new', plainAnnouncement);
}
```

With:

```typescript
await emitSocketEvent('announcement:new', plainAnnouncement);
```

## Testing

### 1. Test Socket.IO Server

```bash
curl https://your-socket-server.up.railway.app/health
```

Should return:
```json
{
  "status": "ok",
  "connectedClients": 0,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test Event Emission

```bash
curl -X POST https://your-socket-server.up.railway.app/api/emit \
  -H "Content-Type: application/json" \
  -d '{"event":"test:event","data":{"message":"Hello"}}'
```

### 3. Test Client Connection

Open browser console on your Vercel app and check for:
- "Socket connected" message
- No connection errors

## Architecture Summary

```
┌─────────────────┐                    ┌──────────────────┐
│   Vercel        │                    │   Railway        │
│   (Next.js)     │                    │   (Socket.IO)    │
│                 │                    │                  │
│  - Frontend     │                    │  - Socket Server │
│  - API Routes   │──HTTP POST────────▶│  - /api/emit     │
│                 │                    │  - /api/socket  │
│                 │                    │                  │
│  Users Browser  │──WebSocket────────▶│                  │
└─────────────────┘                    └──────────────────┘
```

## Cost

- **Railway**: Free tier includes $5/month credit (usually enough for Socket.IO server)
- **Vercel**: Free tier for Next.js app
- **Total**: ~$0-5/month

## Troubleshooting

### Socket.IO not connecting

1. Check `NEXT_PUBLIC_SOCKET_URL` is set in Vercel
2. Check `ALLOWED_ORIGIN` includes your Vercel domain
3. Check Railway logs for connection errors
4. Verify CORS settings in `socket-server.js`

### Events not emitting

1. Check `SOCKET_SERVER_URL` is set in Vercel
2. Check Railway logs for `/api/emit` requests
3. Verify API routes are calling `emitSocketEvent()`

### CORS errors

1. Make sure `ALLOWED_ORIGIN` in Railway includes your exact Vercel domain
2. Include protocol: `https://your-app.vercel.app` (not just `your-app.vercel.app`)

## Quick Start Checklist

- [ ] Create `socket-server.js` file
- [ ] Create minimal `package.json` with `socket.io` and `express`
- [ ] Deploy to Railway
- [ ] Set `ALLOWED_ORIGIN` environment variable in Railway
- [ ] Get Railway URL
- [ ] Set `SOCKET_SERVER_URL` and `NEXT_PUBLIC_SOCKET_URL` in Vercel
- [ ] Update API routes to use `emitSocketEvent()` (already done in socket.ts)
- [ ] Test Socket.IO connection
- [ ] Test event emission
