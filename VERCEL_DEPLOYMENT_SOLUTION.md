# Vercel Deployment Solution for Socket.IO

## ❌ Problem: Socket.IO Doesn't Work on Vercel

Vercel uses **serverless functions** which:
- ❌ Don't support custom Node.js servers (`server.js`)
- ❌ Can't maintain persistent WebSocket connections
- ❌ Have execution time limits (10 seconds for Hobby, 60s for Pro)

Your app uses `server.js` with Socket.IO, which **won't work** on Vercel.

## ✅ Solution Options

### Option 1: Hybrid Deployment (Recommended)

**Deploy Next.js app on Vercel + Socket.IO server separately**

#### Architecture:
```
┌─────────────────┐         ┌──────────────────┐
│   Vercel        │         │  Socket.IO       │
│   (Next.js)     │────────▶│  Server          │
│   Frontend      │  HTTP   │  (Railway/Render)│
│   + API Routes  │         │                  │
└─────────────────┘         └──────────────────┘
```

#### Steps:

**1. Deploy Next.js App to Vercel (without Socket.IO)**

- Vercel will automatically detect Next.js
- Your API routes will work fine
- Build command: `npm run build` (but it will use `next build`, not `server.js`)
- Output: `.next` folder

**2. Create Separate Socket.IO Server**

Create a new file `socket-server.js`:

```javascript
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const port = process.env.PORT || 3001;
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://your-vercel-app.vercel.app';

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/api/socket'
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available for other modules
global.io = io;

httpServer.listen(port, () => {
  console.log(`Socket.IO server running on port ${port}`);
  console.log(`Allowed origin: ${allowedOrigin}`);
});
```

**3. Deploy Socket.IO Server to Railway/Render**

**Railway:**
1. Create new project
2. Connect GitHub repo
3. Set root directory to your project
4. Set start command: `node socket-server.js`
5. Add environment variable: `ALLOWED_ORIGIN=https://your-vercel-app.vercel.app`

**Render:**
1. Create new Web Service
2. Build command: `npm install`
3. Start command: `node socket-server.js`
4. Add environment variable: `ALLOWED_ORIGIN=https://your-vercel-app.vercel.app`

**4. Update Your API Routes to Use External Socket Server**

Update your API routes (e.g., `app/api/announcements/route.ts`):

```typescript
// Instead of global.io, use HTTP requests to Socket.IO server
const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || 'http://localhost:3001';

// When emitting events:
await fetch(`${SOCKET_SERVER_URL}/api/socket/emit`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'announcement:new',
    data: announcement
  })
});
```

**5. Update Socket Client**

Update `src/lib/socket.ts`:

```typescript
const getSocketUrl = () => {
  if (typeof window === 'undefined') return '';
  // Use external Socket.IO server URL
  return process.env.NEXT_PUBLIC_SOCKET_URL || 'https://your-socket-server.railway.app';
};
```

**6. Environment Variables**

**Vercel:**
```env
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.railway.app
SOCKET_SERVER_URL=https://your-socket-server.railway.app
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret
```

**Socket Server (Railway/Render):**
```env
ALLOWED_ORIGIN=https://your-vercel-app.vercel.app
PORT=3001
```

---

### Option 2: Move Entire App to Railway/Render

**Simpler but loses Vercel benefits**

1. Deploy entire app to Railway or Render
2. Use `server.js` as-is
3. Everything works together

**Railway:**
- Build: `npm run build`
- Start: `npm start` (uses server.js)
- Cost: ~$5/month

**Render:**
- Build: `npm run build`
- Start: `npm start`
- Free tier available (with limitations)

---

### Option 3: Use Polling Instead of WebSockets (Not Recommended)

Replace real-time WebSocket with polling:

```typescript
// Instead of Socket.IO, poll API every few seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetchAnnouncements();
  }, 3000); // Poll every 3 seconds
  
  return () => clearInterval(interval);
}, []);
```

**Pros:** Works on Vercel
**Cons:** Higher latency, more API calls, worse UX

---

## Recommended: Option 1 (Hybrid)

### Why Hybrid is Best:

✅ **Vercel Benefits:**
- Fast global CDN
- Automatic HTTPS
- Easy deployments
- Great Next.js integration
- Free tier for hobby projects

✅ **Separate Socket Server:**
- Socket.IO works perfectly
- Real-time updates work
- Can scale independently

### Implementation Steps:

1. **Keep Next.js on Vercel** - Your app will work, just without Socket.IO
2. **Deploy Socket.IO server to Railway** (easiest) or Render
3. **Update environment variables** in both platforms
4. **Update API routes** to emit events via HTTP to Socket server
5. **Update client** to connect to external Socket server

### Cost Estimate:

- **Vercel**: Free (Hobby) or $20/month (Pro)
- **Railway**: ~$5/month (or free with credits)
- **Total**: ~$5-25/month

---

## Quick Fix: Make Socket.IO Optional

If you want to deploy to Vercel immediately and add Socket.IO later:

1. Make Socket.IO connection optional in your code
2. App will work without real-time updates
3. Add Socket.IO server later when needed

Update `src/lib/socket.ts`:

```typescript
connect() {
  if (typeof window === 'undefined') return null as any;
  
  const url = getSocketUrl();
  if (!url) {
    console.warn('Socket.IO server not configured, real-time updates disabled');
    return null as any;
  }
  
  // ... rest of connection code
}
```

---

## Summary

**Current Situation:**
- ❌ Your `server.js` with Socket.IO won't work on Vercel
- ✅ Next.js app and API routes will work fine
- ❌ Real-time Socket.IO updates won't work

**Best Solution:**
- ✅ Deploy Next.js to Vercel
- ✅ Deploy Socket.IO server separately (Railway/Render)
- ✅ Connect them via environment variables

**Alternative:**
- Move entire app to Railway/Render (simpler, but lose Vercel benefits)
