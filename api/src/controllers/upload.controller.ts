import { Request, Response } from 'express';
import multer, { Multer } from 'multer';
import path from 'path';
import { uploadService } from '../services/upload.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ValidationError } from '../utils/errors.js';

// Secure file-filter: reject anything that is not an allowed image extension
// BEFORE multer buffers it. SVG is excluded (XSS risk). Errors thrown here
// flow to the central errorHandler as an AppError (400).
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    cb(new ValidationError(`Unsupported file type. Allowed extensions: ${allowedExtensions.join(', ')} (SVG is rejected for XSS safety)`));
    return;
  }
  cb(null, true);
};

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});
export const uploadMiddleware: Multer = upload;

export const uploadController = {
  /**
   * POST /api/upload
   * Upload a single file
   */
  upload: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ValidationError('No file provided');
    }

    // Validate file (mimetype + size + extension)
    const validation = uploadService.validateFile(req.file);
    if (!validation.valid) {
      throw new ValidationError(validation.error || 'Invalid file');
    }

    // Bucket comes from the multipart body; validated against the allowlist
    // inside the service (allowed → stored there, missing → default, unknown → 400).
    const bucket = typeof req.body?.bucket === 'string' ? req.body.bucket : undefined;

    // Save file
    const result = await uploadService.saveFile(req.file, bucket);

    res.status(201).json({
      message: 'File uploaded successfully',
      data: result,
    });
  }),

  /**
   * DELETE /api/upload/:filename
   * Delete a file
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const filename = req.params.filename as string;

    if (!filename) {
      throw new ValidationError('Filename is required');
    }

    const bucket = typeof req.query?.bucket === 'string' ? req.query.bucket : undefined;
    await uploadService.deleteFile(filename, bucket);

    res.json({ message: 'File deleted successfully' });
  }),
};
