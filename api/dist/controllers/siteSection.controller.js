import { ZodError } from 'zod';
import { siteSectionService } from '../services/siteSection.service.js';
import { siteSectionUpdateSchema, siteSectionReorderSchema } from '@jsoft/shared';
// Helper to ensure param is a string (Express 5 types can be string | string[])
const getStringParam = (param) => {
    if (Array.isArray(param))
        return param[0];
    return param || '';
};
export const siteSectionController = {
    async findAll(_req, res) {
        try {
            const sections = await siteSectionService.findAll();
            res.json(sections);
        }
        catch (error) {
            console.error('SiteSection findAll error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async findById(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const section = await siteSectionService.findById(id);
            if (!section) {
                res.status(404).json({ error: 'Site section not found' });
                return;
            }
            res.json(section);
        }
        catch (error) {
            console.error('SiteSection findById error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async reorder(req, res) {
        try {
            const data = siteSectionReorderSchema.parse(req.body);
            const sections = await siteSectionService.reorder(data);
            res.json(sections);
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
                return;
            }
            console.error('SiteSection reorder error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async update(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const data = siteSectionUpdateSchema.parse(req.body);
            const existing = await siteSectionService.findById(id);
            if (!existing) {
                res.status(404).json({ error: 'Site section not found' });
                return;
            }
            const section = await siteSectionService.update(id, data);
            res.json(section);
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
                return;
            }
            console.error('SiteSection update error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};
//# sourceMappingURL=siteSection.controller.js.map