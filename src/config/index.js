import { createPool } from '../../../shared/config/database.js';

export const pool = createPool('files');

export const uploadConfig = {
  maxSize: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10) * 1024 * 1024,
  uploadDir: process.env.UPLOAD_DIR || './uploads',
};
