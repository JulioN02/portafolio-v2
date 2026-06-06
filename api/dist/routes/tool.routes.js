import { Router } from 'express';
import { toolController } from '../controllers/tool.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = Router();
// Public routes
router.get('/', toolController.findAll);
router.get('/featured', toolController.findFeatured);
router.get('/classifications', toolController.getClassifications);
router.get('/:slug', toolController.findBySlug);
router.get('/by-id/:id', toolController.findById);
// Protected routes (admin)
router.post('/', authMiddleware, toolController.create);
router.put('/:id', authMiddleware, toolController.update);
router.delete('/:id', authMiddleware, toolController.delete);
router.patch('/:id/restore', authMiddleware, toolController.restore);
router.patch('/:id/featured', authMiddleware, toolController.toggleFeatured);
router.patch('/:id/status', authMiddleware, toolController.updateStatus);
export default router;
//# sourceMappingURL=tool.routes.js.map