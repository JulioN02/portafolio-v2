import { Request, Response } from 'express';
import multer, { Multer } from 'multer';
import { uploadService } from '../services/upload.service.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
export const uploadMiddleware: Multer = upload;

export const uploadController = {
  /**
   * POST /api/upload
   * Upload a single file
   */
  async upload(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      // Validate file
      const validation = uploadService.validateFile(req.file);
      if (!validation.valid) {
        res.status(400).json({ error: validation.error });
        return;
      }

      // Save file
      const result = await uploadService.saveFile(req.file);

      res.status(201).json({
        message: 'File uploaded successfully',
        data: result,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  },

  /**
   * DELETE /api/upload/:filename
   * Delete a file
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const filename = req.params.filename as string;

      if (!filename) {
        res.status(400).json({ error: 'Filename is required' });
        return;
      }

      await uploadService.deleteFile(filename);

      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  },
};
