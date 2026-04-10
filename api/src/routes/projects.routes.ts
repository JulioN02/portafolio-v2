import { Router, IRouter } from 'express';
import { projectsController } from '../controllers/projects.controller.js';

const router: IRouter = Router();

// All routes are public
router.get('/', projectsController.findAll);
router.get('/recent', projectsController.findRecent);
router.get('/classifications', projectsController.getClassifications);

export default router;
