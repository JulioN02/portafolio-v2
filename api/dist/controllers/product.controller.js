import { ZodError } from 'zod';
import { productService } from '../services/product.service.js';
import { productSchema, productUpdateSchema, productFilterSchema, productStatusSchema } from '@jsoft/shared';
// Helper to ensure param is a string (Express 5 types can be string | string[])
const getStringParam = (param) => {
    if (Array.isArray(param))
        return param[0];
    return param || '';
};
export const productController = {
    async findAll(req, res) {
        try {
            const filter = productFilterSchema.parse(req.query);
            const result = await productService.findAll(filter);
            res.json(result);
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ error: 'Invalid filter parameters', details: error.flatten().fieldErrors });
                return;
            }
            console.error('Product findAll error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async findBySlug(req, res) {
        try {
            const slug = getStringParam(req.params.slug);
            const product = await productService.findBySlug(slug);
            if (!product) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            res.json(product);
        }
        catch (error) {
            console.error('Product findBySlug error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async findFeatured(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 3;
            const products = await productService.findFeatured(limit);
            res.json(products);
        }
        catch (error) {
            console.error('Product findFeatured error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async findById(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const product = await productService.findById(id);
            if (!product) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            res.json(product);
        }
        catch (error) {
            console.error('Product findById error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async create(req, res) {
        try {
            const data = productSchema.parse(req.body);
            const product = await productService.create(data);
            res.status(201).json(product);
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
                return;
            }
            console.error('Product create error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async update(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const data = productUpdateSchema.parse(req.body);
            const existing = await productService.findById(id);
            if (!existing) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            const product = await productService.update(id, data);
            res.json(product);
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
                return;
            }
            console.error('Product update error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async delete(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const existing = await productService.findById(id);
            if (!existing) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            await productService.softDelete(id);
            res.json({ message: 'Product deleted successfully' });
        }
        catch (error) {
            console.error('Product delete error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async restore(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const existing = await productService.findById(id);
            if (!existing) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            const product = await productService.restore(id);
            res.json(product);
        }
        catch (error) {
            console.error('Product restore error:', error);
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
            const existing = await productService.findById(id);
            if (!existing) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            const product = await productService.update(id, { featured });
            res.json(product);
        }
        catch (error) {
            console.error('Product toggleFeatured error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async updateStatus(req, res) {
        try {
            const id = getStringParam(req.params.id);
            const { status } = productStatusSchema.parse(req.body);
            const existing = await productService.findById(id);
            if (!existing) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            const product = await productService.updateStatus(id, status);
            res.json(product);
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
                return;
            }
            console.error('Product updateStatus error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async getClassifications(_req, res) {
        try {
            const classifications = await productService.getClassifications();
            res.json(classifications);
        }
        catch (error) {
            console.error('Product getClassifications error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};
//# sourceMappingURL=product.controller.js.map