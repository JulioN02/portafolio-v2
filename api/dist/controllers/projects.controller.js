import { projectsService } from '../services/projects.service.js';
export const projectsController = {
    async findAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const classification = req.query.classification;
            const type = req.query.type;
            // Validate type if provided
            if (type && !['service', 'product', 'tool', 'successCase'].includes(type)) {
                res.status(400).json({ error: 'Invalid type. Must be: service, product, tool, or successCase' });
                return;
            }
            const result = await projectsService.findAll({ page, limit, classification, type });
            res.json(result);
        }
        catch (error) {
            console.error('Projects findAll error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async findRecent(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 3;
            const projects = await projectsService.findRecent(limit);
            res.json({
                data: projects,
                pagination: {
                    page: 1,
                    limit,
                    total: projects.length,
                    totalPages: 1,
                    hasNext: false,
                    hasPrev: false,
                },
            });
        }
        catch (error) {
            console.error('Projects findRecent error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async getClassifications(_req, res) {
        try {
            const classifications = await projectsService.getClassifications();
            res.json(classifications);
        }
        catch (error) {
            console.error('Projects getClassifications error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};
//# sourceMappingURL=projects.controller.js.map