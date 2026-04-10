import { Router, IRouter } from 'express';
import { successCaseController } from '../controllers/successCase.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// Public routes
router.get('/', successCaseController.findAll);
router.get('/recent', successCaseController.findRecent);
router.get('/:slug', successCaseController.findBySlug);
router.get('/by-id/:id', successCaseController.findById);

// Protected routes (admin)
router.post('/', authMiddleware, successCaseController.create);
router.put('/:id', authMiddleware, successCaseController.update);
router.delete('/:id', authMiddleware, successCaseController.delete);
router.patch('/:id/restore', authMiddleware, successCaseController.restore);

export default router;
