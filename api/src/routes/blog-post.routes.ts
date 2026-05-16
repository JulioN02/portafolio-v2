import { Router, IRouter } from 'express';
import { blogPostController } from '../controllers/blog-post.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// Public routes
router.get('/', blogPostController.findAll);
router.get('/categories', blogPostController.getCategories);
router.get('/:slug', blogPostController.findBySlug);
router.get('/by-id/:id', blogPostController.findById);

// Protected routes (admin)
router.post('/', authMiddleware, blogPostController.create);
router.put('/:id', authMiddleware, blogPostController.update);
router.delete('/:id', authMiddleware, blogPostController.delete);
router.patch('/:id/restore', authMiddleware, blogPostController.restore);
router.patch('/:id/reorder', authMiddleware, blogPostController.reorder);
router.patch('/:id/status', authMiddleware, blogPostController.updateStatus);

export default router;