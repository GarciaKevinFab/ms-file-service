import { pool } from '../config/index.js';

// ── Create ─────────────────────────────────────────────────
export const create = async ({ userId, originalName, storedName, mimeType, sizeBytes, path, thumbnailPath, isPublic }) => {
  const result = await pool.query(
    `INSERT INTO files (user_id, original_name, stored_name, mime_type, size_bytes, path, thumbnail_path, is_public)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, user_id, original_name, stored_name, mime_type, size_bytes, path, thumbnail_path, is_public, created_at, updated_at`,
    [userId, originalName, storedName, mimeType, sizeBytes, path, thumbnailPath || null, isPublic || false]
  );
  return result.rows[0];
};

// ── Find by ID ─────────────────────────────────────────────
export const findById = async (id) => {
  const result = await pool.query(
    `SELECT id, user_id, original_name, stored_name, mime_type, size_bytes, path, thumbnail_path, is_public, created_at, updated_at
     FROM files
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

// ── Find by user (paginated) ───────────────────────────────
export const findByUser = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM files WHERE user_id = $1',
    [userId]
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await pool.query(
    `SELECT id, user_id, original_name, stored_name, mime_type, size_bytes, path, thumbnail_path, is_public, created_at, updated_at
     FROM files
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return { rows: result.rows, total };
};

// ── Delete by ID ───────────────────────────────────────────
export const deleteById = async (id) => {
  const result = await pool.query(
    'DELETE FROM files WHERE id = $1 RETURNING id, path, thumbnail_path',
    [id]
  );
  return result.rows[0] || null;
};
