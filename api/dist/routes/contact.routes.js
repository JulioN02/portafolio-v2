import { Router } from 'express';
import { contactController } from '../controllers/contact.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = Router();
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
// PATCH /api/contact/:id/star - Toggle star status
router.patch('/:id/star', contactController.toggleStar);
// PATCH /api/contact/:id/read - Mark contact as read
router.patch('/:id/read', contactController.markRead);
// PATCH /api/contact/:id/archive - Toggle archive status
router.patch('/:id/archive', contactController.toggleArchive);
// POST /api/contact/:id/labels - Set labels
router.post('/:id/labels', contactController.setLabels);
// GET /api/contact/:id - Get single contact form
router.get('/:id', contactController.findById);
// DELETE /api/contact/:id - Delete contact form
router.delete('/:id', contactController.delete);
export default router;
//# sourceMappingURL=contact.routes.js.map