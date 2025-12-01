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
    this.socket = io(url || window.location.origin, {
      path: '/api/socket',
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) this.connect();
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  getSocket() {
    if (!this.socket) this.connect();
    return this.socket;
  }
}

export const socketClient = new SocketClient();
