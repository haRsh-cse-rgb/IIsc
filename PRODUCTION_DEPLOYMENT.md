# Production Deployment Guide - Socket.IO & Next.js

## Important: Socket.IO Production Requirements

Your app uses a **custom Next.js server** (`server.js`) that integrates Socket.IO. This means:

### ❌ DON'T use:
- `next start` (won't include Socket.IO)
- Static export (`next export`)
- Serverless platforms that don't support custom servers (Vercel, Netlify Functions)

### ✅ DO use:
- Custom server (`node server.js`)
- Platforms that support Node.js servers (Railway, Render, DigitalOcean, AWS EC2, etc.)

## Production Deployment Steps

### 1. Build the Application

```bash
npm run build
```

This creates the optimized Next.js production build in `.next/` folder.

### 2. Start Production Server

```bash
npm start
```

Or directly:
```bash
NODE_ENV=production node server.js
```

**Important**: Always use `server.js`, not `next start`!

### 3. Environment Variables

Create a `.env.production` file:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# JWT
JWT_SECRET=your-very-secure-random-secret-min-32-chars

# App URLs (for CORS and Socket.IO)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com

# Optional: For scaling with Redis
REDIS_URL=redis://localhost:6379
```

## Reverse Proxy Configuration (Nginx)

Socket.IO requires WebSocket upgrade support. Here's the correct Nginx config:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO endpoint (IMPORTANT: matches /api/socket path)
    location /api/socket {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket specific timeouts
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

## Platform-Specific Deployment

### Railway / Render / DigitalOcean App Platform

1. **Build Command**: `npm run build`
2. **Start Command**: `npm start` (or `NODE_ENV=production node server.js`)
3. **Environment Variables**: Add all from step 3 above
4. **Port**: Usually auto-assigned, use `process.env.PORT`

### AWS EC2 / VPS

1. **Install Node.js** (v18+)
2. **Clone repository**
3. **Install dependencies**: `npm install --production`
4. **Build**: `npm run build`
5. **Use PM2 for process management**:

```bash
npm install -g pm2
pm2 start server.js --name stis-app --env production
pm2 save
pm2 startup
```

PM2 ecosystem file (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [{
    name: 'stis-app',
    script: './server.js',
    instances: 1, // Use 1 for Socket.IO (or use Redis adapter for scaling)
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

Then: `pm2 start ecosystem.config.js`

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    restart: unless-stopped
```

## Scaling Socket.IO (Multiple Instances)

If you need to run multiple server instances, you **MUST** use Redis adapter:

### 1. Install Redis Adapter

```bash
npm install @socket.io/redis-adapter redis
```

### 2. Update server.js

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

// ... existing code ...

app.prepare().then(async () => {
  const httpServer = createServer(async (req, res) => {
    // ... existing handler ...
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${port}`,
      methods: ['GET', 'POST']
    },
    path: '/api/socket'
  });

  // Add Redis adapter for scaling
  if (process.env.REDIS_URL) {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));
    console.log('> Redis adapter enabled for Socket.IO scaling');
  }

  // ... rest of socket setup ...
});
```

### 3. Update PM2 for Multiple Instances

```javascript
module.exports = {
  apps: [{
    name: 'stis-app',
    script: './server.js',
    instances: 'max', // Now safe with Redis adapter
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      REDIS_URL: 'redis://localhost:6379'
    }
  }]
};
```

## Testing Socket.IO in Production

1. **Check Socket.IO connection**:
   - Open browser console
   - Look for "Socket connected" message
   - Check Network tab for WebSocket connection to `/api/socket`

2. **Test real-time updates**:
   - Open app in two browser windows
   - Make a change (e.g., create announcement)
   - Verify it appears in both windows instantly

3. **Check server logs**:
   - Should see "Client connected: [socket-id]" messages

## Common Issues & Solutions

### Issue: Socket.IO not connecting in production

**Solutions**:
1. ✅ Verify you're using `server.js`, not `next start`
2. ✅ Check Nginx config has WebSocket upgrade headers
3. ✅ Verify `NEXT_PUBLIC_SOCKET_URL` environment variable is set
4. ✅ Check CORS settings in `server.js` match your domain
5. ✅ Ensure firewall allows WebSocket connections

### Issue: Socket.IO works locally but not in production

**Solutions**:
1. ✅ Check HTTPS is enabled (required for PWA)
2. ✅ Verify reverse proxy supports WebSocket upgrades
3. ✅ Check browser console for CORS errors
4. ✅ Verify environment variables are set correctly

### Issue: Multiple instances, sockets not syncing

**Solution**: Implement Redis adapter (see scaling section above)

## Production Checklist

- [ ] Build command: `npm run build`
- [ ] Start command: `npm start` (uses server.js)
- [ ] Environment variables configured
- [ ] HTTPS/SSL enabled
- [ ] Nginx/Reverse proxy configured for WebSocket
- [ ] MongoDB connection string set
- [ ] JWT_SECRET is strong and secure
- [ ] CORS origins configured correctly
- [ ] Socket.IO path matches (`/api/socket`)
- [ ] Test Socket.IO connection works
- [ ] Test real-time updates work
- [ ] PM2 or process manager configured (if VPS)
- [ ] Redis adapter installed (if scaling)

## Monitoring

Monitor Socket.IO connections:

```javascript
// Add to server.js
io.engine.on("connection_error", (err) => {
  console.error("Socket.IO connection error:", err);
});

// Log connection stats
setInterval(() => {
  console.log(`Active Socket.IO connections: ${io.sockets.sockets.size}`);
}, 60000); // Every minute
```

## Summary

**Key Points**:
1. ✅ Always use `server.js` (custom server), never `next start`
2. ✅ Configure reverse proxy for WebSocket upgrades
3. ✅ Set `NEXT_PUBLIC_SOCKET_URL` environment variable
4. ✅ Use Redis adapter if running multiple instances
5. ✅ Test Socket.IO connections after deployment

Your Socket.IO setup is already integrated in `server.js`, so as long as you use that file to start the server, Socket.IO will work automatically!
