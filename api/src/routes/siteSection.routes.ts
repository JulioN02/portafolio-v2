import { Router, IRouter } from 'express';
import { siteSectionController } from '../controllers/siteSection.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// Public routes
router.get('/', siteSectionController.findAll);
router.get('/:id', siteSectionController.findById);

// Protected routes (admin)
router.put('/reorder', authMiddleware, siteSectionController.reorder);
router.patch('/:id', authMiddleware, siteSectionController.update);

export default router;
