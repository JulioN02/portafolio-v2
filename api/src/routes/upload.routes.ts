import { Router, IRouter } from 'express';
import { uploadController, uploadMiddleware } from '../controllers/upload.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// All upload routes require authentication
router.use(authMiddleware);

// POST /api/upload - Upload a file
router.post('/', uploadMiddleware.single('file'), uploadController.upload);

// DELETE /api/upload/:filename - Delete a file
router.delete('/:filename', uploadController.delete);

export default router;
