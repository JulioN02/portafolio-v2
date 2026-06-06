import { z } from 'zod';
import { ZodError } from 'zod';
import { contactService } from '../services/contact.service.js';
import { clientContactSchema, recruiterContactSchema } from '@jsoft/shared';
import { NotFoundError } from '../utils/errors.js';
export const contactController = {
    /**
     * POST /api/contact/client
     * Submit a contact form from a client
     */
    async createClient(req, res) {
        try {
            const data = clientContactSchema.parse(req.body);
            const source = req.body.source || 'general';
            const contact = await contactService.createClientContact(data, source);
            res.status(201).json({
                message: 'Contact form submitted successfully',
                data: contact,
            });
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    error: 'Validation Error',
                    details: error.flatten().fieldErrors,
                });
                return;
            }
            console.error('Create client contact error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * POST /api/contact/recruiter
     * Submit a contact form from a recruiter
     */
    async createRecruiter(req, res) {
        try {
            const data = recruiterContactSchema.parse(req.body);
            const contact = await contactService.createRecruiterContact(data);
            res.status(201).json({
                message: 'Contact form submitted successfully',
                data: contact,
            });
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    error: 'Validation Error',
                    details: error.flatten().fieldErrors,
                });
                return;
            }
            console.error('Create recruiter contact error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * GET /api/contact
     * Get all contact forms (admin only)
     */
    async findAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const originType = req.query.originType;
            const search = req.query.search;
            const isRead = req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined;
            const isArchived = req.query.isArchived !== undefined ? req.query.isArchived === 'true' : undefined;
            const isStarred = req.query.isStarred !== undefined ? req.query.isStarred === 'true' : undefined;
            const label = req.query.label;
            const result = await contactService.findAll({ page, limit, originType, search, isRead, isArchived, isStarred, label });
            res.json(result);
        }
        catch (error) {
            console.error('Find all contacts error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * GET /api/contact/:id
     * Get a single contact form (admin only)
     */
    async findById(req, res) {
        try {
            const id = req.params.id;
            const contact = await contactService.findById(id);
            if (!contact) {
                res.status(404).json({ error: 'Contact form not found' });
                return;
            }
            res.json(contact);
        }
        catch (error) {
            console.error('Find contact by id error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * DELETE /api/contact/:id
     * Delete a contact form (admin only)
     */
    async delete(req, res) {
        try {
            const id = req.params.id;
            const existing = await contactService.findById(id);
            if (!existing) {
                res.status(404).json({ error: 'Contact form not found' });
                return;
            }
            await contactService.delete(id);
            res.json({ message: 'Contact form deleted successfully' });
        }
        catch (error) {
            console.error('Delete contact error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * PATCH /api/contact/:id/read
     * Mark a contact form as read (admin only)
     */
    async markRead(req, res) {
        try {
            const id = req.params.id;
            const result = await contactService.markRead(id);
            res.json(result);
        }
        catch (error) {
            console.error('Mark contact read error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * PATCH /api/contact/:id/archive
     * Toggle archive status of a contact form (admin only)
     */
    async toggleArchive(req, res) {
        try {
            const id = req.params.id;
            const result = await contactService.toggleArchive(id);
            res.json(result);
        }
        catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({ error: error.message });
                return;
            }
            console.error('Toggle contact archive error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * PATCH /api/contact/:id/star
     * Toggle starred status of a contact form (admin only)
     */
    async toggleStar(req, res) {
        try {
            const id = req.params.id;
            const result = await contactService.toggleStar(id);
            res.json(result);
        }
        catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({ error: error.message });
                return;
            }
            console.error('Toggle contact star error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * POST /api/contact/:id/labels
     * Set labels on a contact form (admin only)
     */
    async setLabels(req, res) {
        try {
            const id = req.params.id;
            const labels = z.array(z.string()).parse(req.body.labels);
            const result = await contactService.setLabels(id, labels);
            res.json(result);
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    error: 'Validation Error',
                    details: error.flatten().fieldErrors,
                });
                return;
            }
            console.error('Set contact labels error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    /**
     * GET /api/contact/stats/summary
     * Get contact statistics (admin only)
     */
    async getStats(_req, res) {
        try {
            const stats = await contactService.getStats();
            res.json(stats);
        }
        catch (error) {
            console.error('Get contact stats error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};
//# sourceMappingURL=contact.controller.js.map