import * as FilesService from '../services/files.service.js';
import { sendSuccess, sendError, sendPaginated } from '../../../shared/utils/response.js';
import fs from 'fs';
import mime from 'mime-types';

// ── Upload multiple files ──────────────────────────────────
export const uploadFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No files uploaded', 400);
    }

    const files = await FilesService.uploadFiles(req.files, req.user.sub);
    sendSuccess(res, files, 'Files uploaded successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ── Upload image with auto-resize ──────────────────────────
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image uploaded', 400);
    }

    const file = await FilesService.uploadImage(req.file, req.user.sub);
    sendSuccess(res, file, 'Image uploaded successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ── Get file metadata ──────────────────────────────────────
export const getFileById = async (req, res, next) => {
  try {
    const file = await FilesService.getFileById(req.params.id);
    sendSuccess(res, file);
  } catch (err) {
    next(err);
  }
};

// ── Download file (stream) ─────────────────────────────────
export const downloadFile = async (req, res, next) => {
  try {
    const { filePath, originalName, mimeType, sizeBytes } = await FilesService.getFilePath(req.params.id);

    res.set({
      'Content-Type': mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(originalName)}"`,
      'Content-Length': sizeBytes,
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } catch (err) {
    next(err);
  }
};

// ── Get thumbnail ──────────────────────────────────────────
export const getThumbnail = async (req, res, next) => {
  try {
    const { filePath, mimeType } = await FilesService.getThumbnailPath(req.params.id);

    res.set({
      'Content-Type': mimeType,
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } catch (err) {
    next(err);
  }
};

// ── Delete file ────────────────────────────────────────────
export const deleteFile = async (req, res, next) => {
  try {
    await FilesService.deleteFile(req.params.id, req.user.sub);
    sendSuccess(res, null, 'File deleted successfully');
  } catch (err) {
    next(err);
  }
};

// ── List user files (paginated) ────────────────────────────
export const getUserFiles = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const { rows, total } = await FilesService.getUserFiles(req.params.userId, page, limit);
    sendPaginated(res, rows, total, page, limit);
  } catch (err) {
    next(err);
  }
};
