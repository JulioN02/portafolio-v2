import { Router, IRouter } from 'express';
import { productController } from '../controllers/product.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// ROUTE-ORDER GUARD: /featured, /classifications and /by-id/:id MUST be
// registered before /:slug (Express matches in registration order). Enforced
// by integration tests in api/src/__tests__/by-id-auth.routes.test.ts.

// Public routes
router.get('/', productController.findAll);
router.get('/featured', productController.findFeatured);
router.get('/classifications', productController.getClassifications);

// Protected routes (admin) — detail-by-id requires auth.
router.get('/by-id/:id', authMiddleware, productController.findById);
router.post('/', authMiddleware, productController.create);
router.put('/:id', authMiddleware, productController.update);
router.delete('/:id', authMiddleware, productController.delete);
router.patch('/:id/restore', authMiddleware, productController.restore);
router.patch('/:id/featured', authMiddleware, productController.toggleFeatured);
router.patch('/:id/status', authMiddleware, productController.updateStatus);

// Public detail — MUST come last so /by-id/:id wins.
router.get('/:slug', productController.findBySlug);

export default router;