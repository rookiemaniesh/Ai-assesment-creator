"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clients = void 0;
exports.createWsServer = createWsServer;
exports.emitToClient = emitToClient;
const ws_1 = __importStar(require("ws"));
const url_1 = __importDefault(require("url"));
// clientId → WebSocket connection
const clients = new Map();
exports.clients = clients;
function createWsServer(server) {
    const wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws, req) => {
        // Frontend connects with:  ws://localhost:5000?clientId=<uuid>
        const query = url_1.default.parse(req.url ?? '', true).query;
        const clientId = query.clientId;
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
function emitToClient(clientId, event, data) {
    const ws = clients.get(clientId);
    if (ws && ws.readyState === ws_1.default.OPEN) {
        ws.send(JSON.stringify({ event, ...data }));
    }
}
//# sourceMappingURL=wsServer.js.map