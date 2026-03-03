import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import crypto from 'crypto';
import * as FilesModel from '../models/files.model.js';
import * as ImageService from './image.service.js';
import { uploadConfig } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(__dirname, '../..', uploadConfig.uploadDir);
const thumbnailDir = path.resolve(uploadDir, 'thumbnails');

// Ensure thumbnails directory exists
const ensureThumbnailDir = async () => {
  await fs.mkdir(thumbnailDir, { recursive: true });
};

// ── Upload multiple files ──────────────────────────────────
export const uploadFiles = async (files, userId) => {
  const savedFiles = [];

  for (const file of files) {
    const record = await FilesModel.create({
      userId,
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      path: file.path,
      thumbnailPath: null,
      isPublic: false,
    });
    savedFiles.push(record);
  }

  return savedFiles;
};

// ── Upload image with thumbnail ────────────────────────────
export const uploadImage = async (file, userId) => {
  await ensureThumbnailDir();

  // Generate thumbnail
  const thumbName = `thumb_${crypto.randomUUID()}.jpg`;
  const thumbPath = path.join(thumbnailDir, thumbName);

  await ImageService.generateThumbnail(file.path, thumbPath);

  const record = await FilesModel.create({
    userId,
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    path: file.path,
    thumbnailPath: thumbPath,
    isPublic: false,
  });

  return record;
};

// ── Get file metadata by ID ───────────────────────────────
export const getFileById = async (id) => {
  const file = await FilesModel.findById(id);
  if (!file) {
    const err = new Error('File not found');
    err.statusCode = 404;
    throw err;
  }
  return file;
};

// ── Get actual file path for streaming ────────────────────
export const getFilePath = async (id) => {
  const file = await getFileById(id);

  // Verify file exists on disk
  try {
    await fs.access(file.path);
  } catch {
    const err = new Error('File not found on disk');
    err.statusCode = 404;
    throw err;
  }

  return {
    filePath: file.path,
    originalName: file.original_name,
    mimeType: file.mime_type,
    sizeBytes: file.size_bytes,
  };
};

// ── Get thumbnail path ────────────────────────────────────
export const getThumbnailPath = async (id) => {
  const file = await getFileById(id);

  if (!file.thumbnail_path) {
    const err = new Error('No thumbnail available for this file');
    err.statusCode = 404;
    throw err;
  }

  // Verify thumbnail exists on disk
  try {
    await fs.access(file.thumbnail_path);
  } catch {
    const err = new Error('Thumbnail not found on disk');
    err.statusCode = 404;
    throw err;
  }

  return {
    filePath: file.thumbnail_path,
    mimeType: 'image/jpeg',
  };
};

// ── Delete file ───────────────────────────────────────────
export const deleteFile = async (id, userId) => {
  const file = await getFileById(id);

  if (file.user_id !== userId) {
    const err = new Error('You do not have permission to delete this file');
    err.statusCode = 403;
    throw err;
  }

  // Delete from DB (returns path info)
  const deleted = await FilesModel.deleteById(id);

  // Delete file from disk
  if (deleted && deleted.path) {
    try {
      await fs.unlink(deleted.path);
    } catch {
      console.error(`[File Service] Could not delete file from disk: ${deleted.path}`);
    }
  }

  // Delete thumbnail from disk
  if (deleted && deleted.thumbnail_path) {
    try {
      await fs.unlink(deleted.thumbnail_path);
    } catch {
      console.error(`[File Service] Could not delete thumbnail from disk: ${deleted.thumbnail_path}`);
    }
  }

  return true;
};

// ── Get user files (paginated) ────────────────────────────
export const getUserFiles = async (userId, page, limit) => {
  return FilesModel.findByUser(userId, page, limit);
};
