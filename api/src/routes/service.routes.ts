import { Router, IRouter } from 'express';
import { serviceController } from '../controllers/service.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// Public routes
router.get('/', serviceController.findAll);
router.get('/featured', serviceController.findFeatured);
router.get('/classifications', serviceController.getClassifications);
router.get('/:slug', serviceController.findBySlug);
router.get('/by-id/:id', serviceController.findById);

// Protected routes (admin)
router.post('/', authMiddleware, serviceController.create);
router.put('/:id', authMiddleware, serviceController.update);
router.delete('/:id', authMiddleware, serviceController.delete);
router.patch('/:id/restore', authMiddleware, serviceController.restore);
router.patch('/:id/reorder', authMiddleware, serviceController.reorder);

export default router;