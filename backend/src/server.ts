import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

import { env } from './config/env';
import { connectDB } from './config/db';
import { assignmentQueue } from './queues/assignmentQueue';
import { createWsServer } from './ws/wsServer';
import assignmentRoutes from './routes/assignment.routes';

// ─── App setup ────────────────────────────────────────────────────────────────

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// ─── Bull Board (Dev queue dashboard) ─────────────────────────────────────────

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(assignmentQueue)],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/assignments', assignmentRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Global error handler ─────────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// ─── HTTP + WebSocket server ──────────────────────────────────────────────────

const server = http.createServer(app);
createWsServer(server);

// ─── Start ────────────────────────────────────────────────────────────────────

const start = async () => {
  await connectDB();
  server.listen(Number(env.PORT), () => {
    console.log(`🚀  Server running at http://localhost:${env.PORT}`);
    console.log(`📋  BullBoard  at http://localhost:${env.PORT}/admin/queues`);
    console.log(`🔌  WebSocket  at ws://localhost:${env.PORT}`);
  });
};

start();
