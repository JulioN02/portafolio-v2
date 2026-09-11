import { Router, IRouter } from 'express';
import { successCaseController } from '../controllers/successCase.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// ROUTE-ORDER GUARD: /recent and /by-id/:id MUST be registered before /:slug
// (Express matches in registration order). Enforced by integration tests in
// api/src/__tests__/by-id-auth.routes.test.ts.

// Public routes
router.get('/', successCaseController.findAll);
router.get('/recent', successCaseController.findRecent);

// Protected routes (admin) — detail-by-id requires auth.
router.get('/by-id/:id', authMiddleware, successCaseController.findById);
router.post('/', authMiddleware, successCaseController.create);
router.put('/:id', authMiddleware, successCaseController.update);
router.delete('/:id', authMiddleware, successCaseController.delete);
router.patch('/:id/restore', authMiddleware, successCaseController.restore);
router.patch('/:id/status', authMiddleware, successCaseController.updateStatus);

// Public detail — MUST come last so /by-id/:id wins.
router.get('/:slug', successCaseController.findBySlug);

export default router;