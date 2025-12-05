import { io, Socket } from 'socket.io-client';

const getSocketUrl = () => {
  if (typeof window === 'undefined') return '';
  return process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || '';
};

class SocketClient {
  private socket: Socket | null = null;

  connect() {
    if (typeof window === 'undefined') return null as any;
    if (this.socket?.connected) return this.socket;

    const url = getSocketUrl();
    
    // If no Socket.IO server URL is configured, skip connection
    // This allows the app to work on Vercel without Socket.IO
    if (!url && !window.location.origin.includes('localhost')) {
      console.warn('Socket.IO server not configured. Real-time updates disabled.');
      return null as any;
    }

    try {
      this.socket = io(url || window.location.origin, {
        path: '/api/socket',
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 3, // Reduced attempts for faster failure
        timeout: 5000, // 5 second timeout
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.warn('Socket.IO connection failed. Real-time updates disabled.', error.message);
        // Don't throw, just log - app should work without Socket.IO
      });

      return this.socket;
    } catch (error) {
      console.warn('Failed to initialize Socket.IO. Real-time updates disabled.', error);
      return null as any;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) {
      this.connect();
    }
    // Only attach listener if socket exists and is connected
    if (this.socket?.connected) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  getSocket() {
    if (!this.socket) {
      this.connect();
    }
    return this.socket;
  }
  
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketClient = new SocketClient();
