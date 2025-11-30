# STIS Conference PWA - Deployment Guide

## Quick Start

### 1. Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd stis-conference

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB credentials and settings
```

### 2. Database Setup

The application uses MongoDB. Update the `.env` file with your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/STISV?retryWrites=true&w=majority
JWT_SECRET=your-secure-random-string-here
PORT=3001
VITE_API_URL=http://localhost:3001
```

Run the seed script to populate initial data:

```bash
npm run seed
```

This creates:
- Admin user: admin@stis.edu / admin123
- 4 conference halls
- Sample schedules for 4 days
- Events and announcements

### 3. Local Development

**Terminal 1 - Backend Server:**
```bash
npm run server:dev
```

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev
```

Access the app at http://localhost:5173

## Production Deployment

### Option 1: Single Server Deployment

1. **Build the frontend:**
```bash
npm run build
```

2. **Serve frontend from Express:**

Update `server/index.ts` to serve the built frontend:

```typescript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add after other middleware
app.use(express.static(path.join(__dirname, '../dist')));

// Add before error handlers
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

3. **Start the server:**
```bash
npm run server
```

### Option 2: Separate Frontend/Backend

**Backend (e.g., Heroku, Railway, DigitalOcean):**
```bash
npm run server
```

**Frontend (e.g., Vercel, Netlify):**
- Build command: `npm run build`
- Output directory: `dist`
- Set environment variable: `VITE_API_URL=https://your-api-domain.com`

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret for JWT signing | `random-secure-string-min-32-chars` |
| `PORT` | Server port | `3001` |
| `VITE_API_URL` | Backend API URL | `http://localhost:3001` or `https://api.yourapp.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |

## SSL/HTTPS Setup

PWA features (service workers, push notifications) require HTTPS in production.

### Using Nginx as Reverse Proxy

```nginx
server {
    listen 80;
    server_name conference.yourapp.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name conference.yourapp.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (Free tier available)
3. Create a database user with read/write permissions
4. Whitelist your server IP address (or 0.0.0.0/0 for all IPs)
5. Get the connection string from the "Connect" button
6. Replace `<password>` and `<database>` in the connection string
7. Add to your `.env` file

## Monitoring & Maintenance

### Health Check Endpoint

```bash
curl https://your-api-domain.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Database Backups

Set up automated backups in MongoDB Atlas:
- Go to Clusters → Select Cluster → Backup
- Enable Cloud Backup with appropriate schedule

### Log Monitoring

Production logs can be monitored using:
- Application logs: `pm2 logs` (if using PM2)
- MongoDB logs: Available in Atlas dashboard
- Server logs: `/var/log/` or cloud provider dashboard

## Production Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Change default admin password after first login
- [ ] Set up MongoDB backups
- [ ] Configure CORS for your production domain
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring and alerts
- [ ] Test service worker and PWA installation
- [ ] Test real-time WebSocket connections
- [ ] Verify offline mode works
- [ ] Test on multiple devices and browsers
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure rate limiting for APIs
- [ ] Set up CDN for static assets (optional)

## Troubleshooting

### WebSocket Connection Issues

If real-time updates don't work:
1. Check CORS settings in `server/index.ts`
2. Verify WebSocket port is not blocked
3. Ensure proxy (if any) supports WebSocket upgrade

### Service Worker Issues

If offline mode doesn't work:
1. Service workers require HTTPS (except localhost)
2. Clear browser cache and re-register service worker
3. Check browser console for errors

### MongoDB Connection Issues

1. Verify IP whitelist in MongoDB Atlas
2. Check connection string format
3. Ensure database user has correct permissions
4. Test connection with `mongosh` CLI

## Support

For deployment issues specific to this conference app, contact the development team.

## Scaling Considerations

For larger conferences (1000+ attendees):

1. **Database**: Consider MongoDB replica sets
2. **Server**: Use PM2 cluster mode or multiple instances
3. **WebSocket**: Implement Redis adapter for Socket.IO
4. **Static Assets**: Use CDN (Cloudflare, AWS CloudFront)
5. **Caching**: Add Redis for API response caching

Example PM2 ecosystem file:

```javascript
module.exports = {
  apps: [{
    name: 'stis-conference',
    script: './server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader ts-node/esm',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```
