import { Router, IRouter } from 'express';
import { simulatorController, simulatorUploadMiddleware } from '../controllers/simulator.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// Upload — JWT + multer (1MB, .html/text-html only); bucket forced server-side.
router.post('/upload', authMiddleware, simulatorUploadMiddleware.single('file'), simulatorController.upload);

// Admin list + metadata (editor picker / prefill) — JWT required.
router.get('/', authMiddleware, simulatorController.list);
router.get('/:id', authMiddleware, simulatorController.getMetadata);

// PUBLIC serving endpoint — sandbox CSP headers, no auth (the iframe src).
// Registered last so /upload and /:id win for their exact paths.
router.get('/:id/content', simulatorController.getContent);

export default router;