import { ZodError } from 'zod';
import { successCaseService } from '../services/successCase.service.js';
import { successCaseSchema, successCaseUpdateSchema, successCaseFilterSchema, successCaseStatusSchema } from '@jsoft/shared';
// Helper to ensure param is a string (Express 5 types can be string | string[])
const getStringParam = (param) => {
    if (Array.isArray(param))
        return param[0];
    return param || '';
};
export const successCaseController = {
    async findAll(req, res) {
        try {
            const filter = successCaseFilterSchema.parse(req.query);
            const result = await successCaseService.findAll(filter);
            res.json(result);
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ error: 'Invalid filter parameters', details: error.flatten().fieldErrors });
                return;
            }
            console.error('SuccessCase findAll error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async findBySlug(req, res) {
        try {
            const slug = getStringParam(req.params.slug);
            const successCase = await successCaseService.findBySlug(slug);
            if (!successCase) {
                res.status(404).json({ error: 'Success case not found' });
                return;
            }
            res.json(successCase);
        }
        catch (error) {
            console.error('SuccessCase findBySlug error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async findRecent(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 3;
            const successCases = await successCaseService.findRecent(limit);
            res.json(successCases);
        }
        catch (error) {
            console.error('SuccessCase findRecent error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async findById(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const successCase = await successCaseService.findById(id);
            if (!successCase) {
                res.status(404).json({ error: 'Success case not found' });
                return;
            }
            res.json(successCase);
        }
        catch (error) {
            console.error('SuccessCase findById error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async create(req, res) {
        try {
            const data = successCaseSchema.parse(req.body);
            const successCase = await successCaseService.create(data);
            res.status(201).json(successCase);
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
                return;
            }
            console.error('SuccessCase create error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async update(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const data = successCaseUpdateSchema.parse(req.body);
            const existing = await successCaseService.findById(id);
            if (!existing) {
                res.status(404).json({ error: 'Success case not found' });
                return;
            }
            const successCase = await successCaseService.update(id, data);
            res.json(successCase);
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
                return;
            }
            console.error('SuccessCase update error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async delete(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const existing = await successCaseService.findById(id);
            if (!existing) {
                res.status(404).json({ error: 'Success case not found' });
                return;
            }
            await successCaseService.softDelete(id);
            res.json({ message: 'Success case deleted successfully' });
        }
        catch (error) {
            console.error('SuccessCase delete error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async restore(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const existing = await successCaseService.findById(id);
            if (!existing) {
                res.status(404).json({ error: 'Success case not found' });
                return;
            }
            const successCase = await successCaseService.restore(id);
            res.json(successCase);
        }
        catch (error) {
            console.error('SuccessCase restore error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async updateStatus(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const { status } = successCaseStatusSchema.parse(req.body);
            const existing = await successCaseService.findById(id);
            if (!existing) {
                res.status(404).json({ error: 'Success case not found' });
                return;
            }
            const successCase = await successCaseService.updateStatus(id, status);
            res.json(successCase);
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
                return;
            }
            console.error('SuccessCase updateStatus error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};
//# sourceMappingURL=successCase.controller.js.map