const { createServer } = require('http');
const { Server } = require('socket.io');

const port = parseInt(process.env.PORT || '3001', 10);
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*'; // Set to your Vercel URL in production

// Create HTTP server
const httpServer = createServer();

// Create Socket.IO server first (before using io in HTTP handler)
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin === '*' ? true : allowedOrigin.split(','),
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/api/socket'
});

// Now set up HTTP request handler (can use io now)
httpServer.on('request', (req, res) => {
  // Handle CORS
  const origin = req.headers.origin;
  const isAllowed = allowedOrigin === '*' || (origin && allowedOrigin.split(',').includes(origin));
  
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Health check endpoint
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      connectedClients: io.sockets.sockets.size,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Emit endpoint for Vercel API routes
  if (url.pathname === '/api/emit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { event, data } = JSON.parse(body);

        if (!event) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Event name is required' }));
          return;
        }

        // Emit the event to all connected clients
        io.emit(event, data);
        
        console.log(`Emitted event: ${event} to ${io.sockets.sockets.size} clients`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          event, 
          clients: io.sockets.sockets.size 
        }));
      } catch (error) {
        console.error('Error emitting event:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to emit event' }));
      }
    });
    return;
  }

  // 404 for other routes
  res.writeHead(404);
  res.end('Not found');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
httpServer.listen(port, () => {
  console.log(`Socket.IO server running on port ${port}`);
  console.log(`Allowed origin: ${allowedOrigin}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Emit endpoint: http://localhost:${port}/api/emit`);
});
