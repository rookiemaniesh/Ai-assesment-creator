import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import url from 'url';

// clientId → WebSocket connection
const clients = new Map<string, WebSocket>();

export function createWsServer(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    // Frontend connects with:  ws://localhost:5000?clientId=<uuid>
    const query = url.parse(req.url ?? '', true).query;
    const clientId = query.clientId as string | undefined;

    if (!clientId) {
      ws.close(1008, 'clientId query param is required');
      return;
    }

    clients.set(clientId, ws);
    console.log(`🔌  WS client connected: ${clientId}`);

    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`🔌  WS client disconnected: ${clientId}`);
    });

    ws.send(JSON.stringify({ event: 'connected', clientId }));
  });

  return wss;
}

/**
 * Emit a typed event to a specific connected client.
 * Silently ignores if the client is not connected (e.g. tab closed).
 */
export function emitToClient(
  clientId: string,
  event: string,
  data: Record<string, unknown>
): void {
  const ws = clients.get(clientId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ event, ...data }));
  }
}

export { clients };
