import { Router, IRouter } from 'express';
import { projectController } from '../controllers/project.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// ROUTE-ORDER GUARD: /tags and /by-id/:id MUST be registered BEFORE /:slug
// (Express matches in registration order). Enforced by integration tests in
// api/src/__tests__/project.routes.test.ts.

// Public routes
router.get('/', projectController.findAll);
router.get('/tags', projectController.getTags);

// Protected routes (admin) — /by-id/:id registered before /:slug so "by-id"
// is never captured as a slug.
router.get('/by-id/:id', authMiddleware, projectController.findById);
router.post('/', authMiddleware, projectController.create);
router.put('/:id', authMiddleware, projectController.update);
router.delete('/:id', authMiddleware, projectController.delete);
router.patch('/:id/restore', authMiddleware, projectController.restore);
router.patch('/:id/status', authMiddleware, projectController.updateStatus);
router.patch('/:id/reorder', authMiddleware, projectController.reorder);

// Public detail — MUST come last so /tags and /by-id/:id win.
router.get('/:slug', projectController.findBySlug);

export default router;