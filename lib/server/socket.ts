import { Server as SocketIOServer } from 'socket.io';

export const getSocketIO = (): SocketIOServer | null => {
  // Access the global io instance set by server.js (for local development)
  if (typeof global !== 'undefined' && (global as any).io) {
    return (global as any).io as SocketIOServer;
  }
  return null;
};

// Helper to emit events - works with both local Socket.IO and remote Socket.IO server
export async function emitSocketEvent(event: string, data: any): Promise<boolean> {
  // Try local Socket.IO first (for development with server.js)
  const localIO = getSocketIO();
  if (localIO) {
    localIO.emit(event, data);
    console.log(`Emitted event ${event} via local Socket.IO`);
    return true;
  }

  // Fall back to remote Socket.IO server (for Vercel/production)
  const socketServerUrl = process.env.SOCKET_SERVER_URL;
  if (socketServerUrl) {
    try {
      const response = await fetch(`${socketServerUrl}/api/emit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event, data }),
      });

      if (!response.ok) {
        console.error(`Failed to emit event ${event}:`, response.statusText);
        return false;
      }

      const result = await response.json();
      console.log(`Emitted event ${event} to ${result.clients || 0} clients via remote server`);
      return true;
    } catch (error) {
      console.error(`Error emitting Socket.IO event ${event}:`, error);
      return false;
    }
  }

  // No Socket.IO available (Vercel without external server)
  console.log(`Socket.IO not available, skipping emit: ${event}`);
  return false;
}

