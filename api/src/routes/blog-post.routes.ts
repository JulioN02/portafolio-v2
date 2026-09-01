import { Router, IRouter } from 'express';
import { blogPostController } from '../controllers/blog-post.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// ROUTE-ORDER GUARD: /tags, /categories and /by-id/:id MUST be registered
// before /:slug (Express matches in registration order). Enforced by
// integration tests in api/src/__tests__/blog-post.routes.test.ts.

// Public routes
router.get('/', blogPostController.findAll);
router.get('/tags', blogPostController.getTags);
router.get('/categories', blogPostController.getCategories);

// Protected routes (admin) — /by-id/:id registered before /:slug so "by-id"
// is never captured as a slug.
router.get('/by-id/:id', authMiddleware, blogPostController.findById);
router.post('/', authMiddleware, blogPostController.create);
router.put('/:id', authMiddleware, blogPostController.update);
router.delete('/:id', authMiddleware, blogPostController.delete);
router.patch('/:id/restore', authMiddleware, blogPostController.restore);
router.patch('/:id/status', authMiddleware, blogPostController.updateStatus);

// Public detail — MUST come last so /tags and /by-id/:id win.
router.get('/:slug', blogPostController.findBySlug);

export default router;