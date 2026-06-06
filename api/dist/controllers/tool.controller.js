import { ZodError } from 'zod';
import { toolService } from '../services/tool.service.js';
import { toolSchema, toolUpdateSchema, toolFilterSchema, toolStatusSchema } from '@jsoft/shared';
// Helper to ensure param is a string (Express 5 types can be string | string[])
const getStringParam = (param) => {
    if (Array.isArray(param))
        return param[0];
    return param || '';
};
export const toolController = {
    async findAll(req, res) {
        try {
            const filter = toolFilterSchema.parse(req.query);
            const result = await toolService.findAll(filter);
            res.json(result);
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ error: 'Invalid filter parameters', details: error.flatten().fieldErrors });
                return;
            }
            console.error('Tool findAll error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async findBySlug(req, res) {
        try {
            const slug = getStringParam(req.params.slug);
            const tool = await toolService.findBySlug(slug);
            if (!tool) {
                res.status(404).json({ error: 'Tool not found' });
                return;
            }
            res.json(tool);
        }
        catch (error) {
            console.error('Tool findBySlug error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async findFeatured(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 3;
            const tools = await toolService.findFeatured(limit);
            res.json(tools);
        }
        catch (error) {
            console.error('Tool findFeatured error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async findById(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const tool = await toolService.findById(id);
            if (!tool) {
                res.status(404).json({ error: 'Tool not found' });
                return;
            }
            res.json(tool);
        }
        catch (error) {
            console.error('Tool findById error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async create(req, res) {
        try {
            const data = toolSchema.parse(req.body);
            const tool = await toolService.create(data);
            res.status(201).json(tool);
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
                return;
            }
            console.error('Tool create error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async update(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const data = toolUpdateSchema.parse(req.body);
            const existing = await toolService.findById(id);
            if (!existing) {
                res.status(404).json({ error: 'Tool not found' });
                return;
            }
            const tool = await toolService.update(id, data);
            res.json(tool);
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
                return;
            }
            console.error('Tool update error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async delete(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const existing = await toolService.findById(id);
            if (!existing) {
                res.status(404).json({ error: 'Tool not found' });
                return;
            }
            await toolService.softDelete(id);
            res.json({ message: 'Tool deleted successfully' });
        }
        catch (error) {
            console.error('Tool delete error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async restore(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const existing = await toolService.findById(id);
            if (!existing) {
                res.status(404).json({ error: 'Tool not found' });
                return;
            }
            const tool = await toolService.restore(id);
            res.json(tool);
        }
        catch (error) {
            console.error('Tool restore error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async toggleFeatured(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const { featured } = req.body;
            if (typeof featured !== 'boolean') {
                res.status(400).json({ error: 'Featured must be a boolean' });
                return;
            }
            const existing = await toolService.findById(id);
            if (!existing) {
                res.status(404).json({ error: 'Tool not found' });
                return;
            }
            const tool = await toolService.update(id, { featured });
            res.json(tool);
        }
        catch (error) {
            console.error('Tool toggleFeatured error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async updateStatus(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const { status } = toolStatusSchema.parse(req.body);
            const existing = await toolService.findById(id);
            if (!existing) {
                res.status(404).json({ error: 'Tool not found' });
                return;
            }
            const tool = await toolService.updateStatus(id, status);
            res.json(tool);
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
                return;
            }
            console.error('Tool updateStatus error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async getClassifications(_req, res) {
        try {
            const classifications = await toolService.getClassifications();
            res.json(classifications);
        }
        catch (error) {
            console.error('Tool getClassifications error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};
//# sourceMappingURL=tool.controller.js.map