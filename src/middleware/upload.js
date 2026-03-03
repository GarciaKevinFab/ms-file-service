import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { uploadConfig } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve upload directory relative to project root
const uploadDir = path.resolve(__dirname, '../..', uploadConfig.uploadDir);

// ── Storage configuration ──────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = crypto.randomUUID() + ext;
    cb(null, uniqueName);
  },
});

// ── File filter ────────────────────────────────────────────
const allowedMimeTypes = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Spreadsheets
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  // Text
  'text/plain',
  'text/csv',
];

const fileFilter = (_req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type '${file.mimetype}' is not allowed`), false);
  }
};

// ── Export configured multer instance ──────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxSize,
  },
});

export default upload;
