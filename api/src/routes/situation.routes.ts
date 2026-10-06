import { Router, IRouter } from 'express';
import { situationController } from '../controllers/situation.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

// Public route: situations with ≥1 PUBLISHED service.
const router: IRouter = Router();
router.get('/', situationController.findPublic);

export default router;

// Admin routes (mounted at /api/admin/situations).
export const adminSituationRoutes: IRouter = Router();
adminSituationRoutes.get('/', authMiddleware, situationController.findAll);
adminSituationRoutes.get('/:id', authMiddleware, situationController.findById);
adminSituationRoutes.post('/', authMiddleware, situationController.create);
adminSituationRoutes.put('/:id', authMiddleware, situationController.update);
adminSituationRoutes.patch('/:id', authMiddleware, situationController.patch);
adminSituationRoutes.delete('/:id', authMiddleware, situationController.delete);
