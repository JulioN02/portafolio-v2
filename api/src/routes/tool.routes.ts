import { Router, IRouter } from 'express';
import { toolController } from '../controllers/tool.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// ROUTE-ORDER GUARD: /featured, /classifications and /by-id/:id MUST be
// registered before /:slug (Express matches in registration order). Enforced
// by integration tests in api/src/__tests__/by-id-auth.routes.test.ts.

// Public routes
router.get('/', toolController.findAll);
router.get('/featured', toolController.findFeatured);
router.get('/classifications', toolController.getClassifications);

// Protected routes (admin) — detail-by-id requires auth.
router.get('/by-id/:id', authMiddleware, toolController.findById);
router.post('/', authMiddleware, toolController.create);
router.put('/:id', authMiddleware, toolController.update);
router.delete('/:id', authMiddleware, toolController.delete);
router.patch('/:id/restore', authMiddleware, toolController.restore);
router.patch('/:id/featured', authMiddleware, toolController.toggleFeatured);
router.patch('/:id/status', authMiddleware, toolController.updateStatus);

// Public detail — MUST come last so /by-id/:id wins.
router.get('/:slug', toolController.findBySlug);

export default router;