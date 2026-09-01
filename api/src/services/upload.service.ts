import path from 'path';
import fs from 'fs';
import { storageService } from './storage.service.js';
import { resolveBucket } from '../config/upload.config.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure local upload directory exists (for local dev fallback, skip on Vercel)
if (!process.env.VERCEL && !fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export interface UploadResult {
  filename: string;
  url: string;
  size: number;
  mimetype: string;
}

export const uploadService = {
  /**
   * Save uploaded file — uploads to remote storage in production, local disk in dev.
   * The `bucket` parameter is validated against the configured allowlist:
   * allowed → stored in that bucket; missing → default bucket; unknown → 400.
   */
  async saveFile(file: Express.Multer.File, bucket?: string): Promise<UploadResult> {
    const resolvedBucket = resolveBucket(bucket);
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${safeName}`;

    if (storageService.isConfigured()) {
      // Production: upload to Supabase Storage in the requested bucket.
      const result = await storageService.uploadFile(file.buffer, filename, file.mimetype, resolvedBucket);
      return {
        filename: result.filename,
        url: result.url,
        size: file.size,
        mimetype: file.mimetype,
      };
    }

    // Local dev: save to disk (flat /uploads dir — bucket not partitioned on
    // disk; validated server-side so the contract holds for dev too).
    const filepath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filepath, file.buffer);

    return {
      filename,
      url: `/uploads/${filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  },

  /**
   * Delete a file — from remote storage or local disk.
   * The `bucket` parameter is validated against the allowlist (unknown → 400).
   */
  async deleteFile(filename: string, bucket?: string): Promise<void> {
    const resolvedBucket = resolveBucket(bucket);
    if (storageService.isConfigured()) {
      await storageService.deleteFile(filename, resolvedBucket);
      return;
    }

    // Local dev: delete from disk
    const filepath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  },

  /**
   * Validate file type and size.
   *
   * SVG is intentionally rejected: SVG files can embed scripts and are a
   * classic stored-XSS vector when served from the same origin. If SVG upload
   * is ever needed, sanitize it server-side (e.g. svgo/sanitize-svg) first.
   */
  validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

    const maxSize = 5 * 1024 * 1024; // 5MB

    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `Invalid file extension: ${ext || '(none)'}. Allowed: ${allowedExtensions.join(', ')} (SVG is rejected for XSS safety)`,
      };
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `Invalid file type: ${file.mimetype}. Allowed: ${allowedMimeTypes.join(', ')}`,
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large: ${file.size} bytes. Max: ${maxSize} bytes`,
      };
    }

    return { valid: true };
  },
};
