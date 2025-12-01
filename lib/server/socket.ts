import { Server as SocketIOServer } from 'socket.io';

export const getSocketIO = (): SocketIOServer | null => {
  // Access the global io instance set by server.js
  if (typeof global !== 'undefined' && (global as any).io) {
    return (global as any).io as SocketIOServer;
  }
  return null;
};

