import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
declare const clients: Map<string, WebSocket>;
export declare function createWsServer(server: http.Server): WebSocketServer;
/**
 * Emit a typed event to a specific connected client.
 * Silently ignores if the client is not connected (e.g. tab closed).
 */
export declare function emitToClient(clientId: string, event: string, data: Record<string, unknown>): void;
export { clients };
//# sourceMappingURL=wsServer.d.ts.map