import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { requestLogger } from '../../shared/middleware/requestLogger.js';
import { errorHandler, notFound } from '../../shared/middleware/errorHandler.js';
import { pool } from './config/index.js';
import filesRouter from './routes/files.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ── Static serving for uploads ─────────────────────────────
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const uploadsPath = path.resolve(__dirname, '..', uploadDir);
app.use('/uploads', express.static(uploadsPath));

// ── Health check ───────────────────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      service: 'file-service',
      status: 'healthy',
      timestamp: result.rows[0].now,
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      service: 'file-service',
      status: 'unhealthy',
      error: err.message,
    });
  }
});

// ── Routes ─────────────────────────────────────────────────
app.use('/files', filesRouter);

// ── Error handling ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
