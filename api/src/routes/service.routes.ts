import { Router, IRouter } from 'express';
import { serviceController } from '../controllers/service.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// ROUTE-ORDER GUARD: /by-id/:id MUST be registered before /:slug so "by-id"
// is never captured as a slug. Enforced by integration tests in
// api/src/__tests__/by-id-auth.routes.test.ts.

// Public routes
router.get('/', serviceController.findAll);
router.get('/classifications', serviceController.getClassifications);

// Protected routes (admin) — detail-by-id requires auth: public sites only
// use /:slug, so protecting by-id cannot break public rendering.
router.get('/by-id/:id', authMiddleware, serviceController.findById);
router.post('/', authMiddleware, serviceController.create);
router.put('/:id', authMiddleware, serviceController.update);
router.delete('/:id', authMiddleware, serviceController.delete);
router.patch('/:id/restore', authMiddleware, serviceController.restore);
router.patch('/:id/status', authMiddleware, serviceController.updateStatus);

// Public detail — MUST come last so /by-id/:id wins.
router.get('/:slug', serviceController.findBySlug);

export default router;