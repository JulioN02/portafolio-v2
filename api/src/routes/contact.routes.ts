import { Router, IRouter } from 'express';
import { contactController } from '../controllers/contact.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// Public routes (no authentication required)
// POST /api/contact/client - Submit contact from client
router.post('/client', contactController.createClient);

// POST /api/contact/recruiter - Submit contact from recruiter
router.post('/recruiter', contactController.createRecruiter);

// Protected routes (admin only)
router.use(authMiddleware);

// GET /api/contact - Get all contact forms
router.get('/', contactController.findAll);

// GET /api/contact/stats/summary - Get contact statistics
router.get('/stats/summary', contactController.getStats);

// GET /api/contact/:id - Get single contact form
router.get('/:id', contactController.findById);

// DELETE /api/contact/:id - Delete contact form
router.delete('/:id', contactController.delete);

export default router;
