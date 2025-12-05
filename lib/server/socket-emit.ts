/**
 * Helper function to emit Socket.IO events from Vercel API routes
 * Since Vercel doesn't support Socket.IO, we send HTTP requests to the external Socket.IO server
 */

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || '';

export async function emitSocketEvent(event: string, data: any): Promise<boolean> {
  // If no Socket.IO server URL is configured, skip (for Vercel without Socket.IO)
  if (!SOCKET_SERVER_URL) {
    console.log(`Socket.IO server not configured, skipping emit: ${event}`);
    return false;
  }

  try {
    const response = await fetch(`${SOCKET_SERVER_URL}/api/emit`, {
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
    console.log(`Emitted event ${event} to ${result.clients || 0} clients`);
    return true;
  } catch (error) {
    console.error(`Error emitting Socket.IO event ${event}:`, error);
    return false;
  }
}
