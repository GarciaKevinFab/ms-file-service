import { Router } from 'express';
import { verifyToken } from '../../../shared/middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import * as FilesController from '../controllers/files.controller.js';
import { pool } from '../config/index.js';

const router = Router();

// ── Health check ───────────────────────────────────────────
router.get('/health', async (_req, res) => {
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

// ── Upload multiple files ──────────────────────────────────
router.post('/upload', verifyToken, upload.array('files', 5), FilesController.uploadFiles);

// ── Upload image with auto-resize/thumbnail ────────────────
router.post('/upload/image', verifyToken, upload.single('file'), FilesController.uploadImage);

// ── Get user files ─────────────────────────────────────────
router.get('/user/:userId', verifyToken, FilesController.getUserFiles);

// ── Get file metadata ──────────────────────────────────────
router.get('/:id', FilesController.getFileById);

// ── Download file ──────────────────────────────────────────
router.get('/:id/download', FilesController.downloadFile);

// ── Get thumbnail ──────────────────────────────────────────
router.get('/:id/thumbnail', FilesController.getThumbnail);

// ── Delete file ────────────────────────────────────────────
router.delete('/:id', verifyToken, FilesController.deleteFile);

export default router;
