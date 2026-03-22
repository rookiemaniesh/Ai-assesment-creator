"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const axios_1 = __importDefault(require("axios"));
const api_1 = require("@bull-board/api");
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
const express_2 = require("@bull-board/express");
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const assignmentQueue_1 = require("./queues/assignmentQueue");
const wsServer_1 = require("./ws/wsServer");
const assignment_routes_1 = __importDefault(require("./routes/assignment.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
// ─── App setup ────────────────────────────────────────────────────────────────
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded files
app.use('/uploads', express_1.default.static('uploads'));
// ─── Bull Board (Dev queue dashboard) ─────────────────────────────────────────
const serverAdapter = new express_2.ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
(0, api_1.createBullBoard)({
    queues: [new bullMQAdapter_1.BullMQAdapter(assignmentQueue_1.assignmentQueue)],
    serverAdapter,
});
app.use('/admin/queues', serverAdapter.getRouter());
// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', auth_routes_1.default);
app.use('/api/assignments', assignment_routes_1.default);
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('❌ Unhandled error:', err.message);
    res.status(500).json({
        success: false,
        message: env_1.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
});
// ─── HTTP + WebSocket server ──────────────────────────────────────────────────
const server = http_1.default.createServer(app);
(0, wsServer_1.createWsServer)(server);
// ─── Start ────────────────────────────────────────────────────────────────────
const start = async () => {
    await (0, db_1.connectDB)();
    // ── AI service health check ───────────────────────────────────────────────
    try {
        const res = await axios_1.default.get(`${env_1.env.AI_SERVICE_URL}/health`, { timeout: 5000 });
        console.log(`✅  AI service reachable at ${env_1.env.AI_SERVICE_URL} — model: ${res.data?.model ?? 'unknown'}`);
    }
    catch {
        console.warn(`⚠️   AI service NOT reachable at ${env_1.env.AI_SERVICE_URL}. Start the Python server or generation jobs will fail.`);
    }
    server.listen(Number(env_1.env.PORT), () => {
        console.log(`🚀  Server running at http://localhost:${env_1.env.PORT}`);
        console.log(`📋  BullBoard  at http://localhost:${env_1.env.PORT}/admin/queues`);
        console.log(`🔌  WebSocket  at ws://localhost:${env_1.env.PORT}`);
    });
};
start();
//# sourceMappingURL=server.js.map