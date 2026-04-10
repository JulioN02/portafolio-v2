import { Router, IRouter } from 'express';
import { productController } from '../controllers/product.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// Public routes
router.get('/', productController.findAll);
router.get('/featured', productController.findFeatured);
router.get('/classifications', productController.getClassifications);
router.get('/:slug', productController.findBySlug);
router.get('/by-id/:id', productController.findById);

// Protected routes (admin)
router.post('/', authMiddleware, productController.create);
router.put('/:id', authMiddleware, productController.update);
router.delete('/:id', authMiddleware, productController.delete);
router.patch('/:id/restore', authMiddleware, productController.restore);
router.patch('/:id/reorder', authMiddleware, productController.reorder);

export default router;
