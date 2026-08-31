import { Router, IRouter } from 'express';
import { portfolioController } from '../controllers/portfolio.controller.js';

const router: IRouter = Router();

// Recruiter aggregation (moved from /api/projects to free the namespace for
// Project CRUD). All routes are public.
router.get('/', portfolioController.findAll);
router.get('/recent', portfolioController.findRecent);
router.get('/classifications', portfolioController.getClassifications);

export default router;