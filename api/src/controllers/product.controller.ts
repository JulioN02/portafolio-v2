import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { productService } from '../services/product.service.js';
import { productSchema, productUpdateSchema, productFilterSchema } from '@jsoft/shared';

// Helper to ensure param is a string (Express 5 types can be string | string[])
const getStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};

export const productController = {
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filter = productFilterSchema.parse(req.query);
      const result = await productService.findAll(filter);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Invalid filter parameters', details: error.flatten().fieldErrors });
        return;
      }
      console.error('Product findAll error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async findBySlug(req: Request, res: Response): Promise<void> {
    try {
      const slug = getStringParam(req.params.slug);
      const product = await productService.findBySlug(slug);
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json(product);
    } catch (error) {
      console.error('Product findBySlug error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async findFeatured(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const products = await productService.findFeatured(limit);
      res.json(products);
    } catch (error) {
      console.error('Product findFeatured error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      const product = await productService.findById(id);
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json(product);
    } catch (error) {
      console.error('Product findById error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = productSchema.parse(req.body);
      const product = await productService.create(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
        return;
      }
      console.error('Product create error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
        return;
      }
      console.error('Product update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      
      const existing = await productService.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      
      await productService.softDelete(id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Product delete error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async restore(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      
      const existing = await productService.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      
      const product = await productService.restore(id);
      res.json(product);
    } catch (error) {
      console.error('Product restore error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async reorder(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      const { order } = req.body;
      
      if (typeof order !== 'number') {
        res.status(400).json({ error: 'Order must be a number' });
        return;
      }
      
      const product = await productService.reorder(id, order);
      res.json(product);
    } catch (error) {
      console.error('Product reorder error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getClassifications(_req: Request, res: Response): Promise<void> {
    try {
      const classifications = await productService.getClassifications();
      res.json(classifications);
    } catch (error) {
      console.error('Product getClassifications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
