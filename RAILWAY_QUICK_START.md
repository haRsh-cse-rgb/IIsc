# Railway Socket.IO Server - Quick Start

## What to Deploy to Railway

**Only 2 files needed:**

1. ✅ `socket-server/socket-server.js` - The Socket.IO server
2. ✅ `socket-server/package.json` - Dependencies (only `socket.io`)

**That's it!** No Next.js, no React, no database - just the Socket.IO server.

## Quick Deployment Steps

### 1. Files are Ready

I've already created:
- ✅ `socket-server/socket-server.js` - Standalone Socket.IO server
- ✅ `socket-server/package.json` - Minimal dependencies

### 2. Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. **Important**: Set **Root Directory** to `socket-server/`
6. Railway will auto-detect and start the server

### 3. Set Environment Variables in Railway

Add these in Railway dashboard:

```env
PORT=3001
ALLOWED_ORIGIN=https://your-vercel-app.vercel.app
```

**Replace** `your-vercel-app.vercel.app` with your actual Vercel domain.

### 4. Get Railway URL

After deployment, Railway gives you a URL like:
```
https://your-socket-server.up.railway.app
```

### 5. Update Vercel Environment Variables

In your Vercel project settings, add:

```env
SOCKET_SERVER_URL=https://your-socket-server.up.railway.app
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.up.railway.app
```

## How It Works

```
┌─────────────────┐                    ┌──────────────────┐
│   Vercel        │                    │   Railway        │
│   (Next.js)     │                    │   (Socket.IO)    │
│                 │                    │                  │
│  API Routes     │──POST /api/emit───▶│  Emit Events     │
│  (when data     │                    │                  │
│   changes)      │                    │                  │
│                 │                    │                  │
│  User Browser   │──WebSocket────────▶│  Receive Events │
└─────────────────┘                    └──────────────────┘
```

1. **User opens app** → Browser connects to Railway Socket.IO server via WebSocket
2. **Admin updates data** → Vercel API route calls Railway `/api/emit` endpoint
3. **Railway emits event** → All connected browsers receive real-time update

## Testing

### Test Socket.IO Server

```bash
# Health check
curl https://your-socket-server.up.railway.app/health

# Test emit
curl -X POST https://your-socket-server.up.railway.app/api/emit \
  -H "Content-Type: application/json" \
  -d '{"event":"test","data":{"message":"Hello"}}'
```

### Test in Browser

1. Open your Vercel app
2. Open browser console
3. Should see: "Socket connected"
4. Make a change (create announcement, etc.)
5. Should see real-time update instantly!

## Cost

- **Railway Free Tier**: $5/month credit (usually enough)
- **Total Cost**: ~$0-5/month

## Summary

**What to deploy to Railway:**
- ✅ Just the `socket-server/` folder (2 files)
- ❌ NOT the full Next.js app
- ❌ NOT the database
- ❌ NOT React components

**Files in socket-server/:**
- `socket-server.js` (Socket.IO server)
- `package.json` (dependencies)

That's all you need! 🚀
