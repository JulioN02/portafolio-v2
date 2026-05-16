import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { blogPostService } from '../services/blog-post.service.js';
import { blogPostSchema, blogPostUpdateSchema, blogPostFilterSchema, postStatusEnum } from '@jsoft/shared';

// Helper to ensure param is a string (Express 5 types can be string | string[])
const getStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0];
  return param || '';
};

export const blogPostController = {
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filter = blogPostFilterSchema.parse(req.query);
      const result = await blogPostService.findAll(filter);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Invalid filter parameters', details: error.flatten().fieldErrors });
        return;
      }
      console.error('BlogPost findAll error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async findBySlug(req: Request, res: Response): Promise<void> {
    try {
      const slug = getStringParam(req.params.slug);
      const post = await blogPostService.findBySlug(slug);
      if (!post) {
        res.status(404).json({ error: 'Blog post not found' });
        return;
      }
      res.json(post);
    } catch (error) {
      console.error('BlogPost findBySlug error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      const post = await blogPostService.findById(id);
      if (!post) {
        res.status(404).json({ error: 'Blog post not found' });
        return;
      }
      res.json(post);
    } catch (error) {
      console.error('BlogPost findById error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = blogPostSchema.parse(req.body);
      const post = await blogPostService.create(data);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
        return;
      }
      console.error('BlogPost create error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      const data = blogPostUpdateSchema.parse(req.body);

      const existing = await blogPostService.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Blog post not found' });
        return;
      }

      const post = await blogPostService.update(id, data);
      res.json(post);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
        return;
      }
      console.error('BlogPost update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);

      const existing = await blogPostService.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Blog post not found' });
        return;
      }

      await blogPostService.softDelete(id);
      res.json({ message: 'Blog post deleted successfully' });
    } catch (error) {
      console.error('BlogPost delete error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async restore(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);

      const existing = await blogPostService.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Blog post not found' });
        return;
      }

      const post = await blogPostService.restore(id);
      res.json(post);
    } catch (error) {
      console.error('BlogPost restore error:', error);
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

      const post = await blogPostService.reorder(id, order);
      res.json(post);
    } catch (error) {
      console.error('BlogPost reorder error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      const { status } = req.body;

      const parsedStatus = postStatusEnum.safeParse(status);
      if (!parsedStatus.success) {
        res.status(400).json({ error: 'Invalid status value' });
        return;
      }

      const post = await blogPostService.updateStatus(id, parsedStatus.data);
      res.json(post);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation Error', details: error.flatten().fieldErrors });
        return;
      }
      console.error('BlogPost updateStatus error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getCategories(_req: Request, res: Response): Promise<void> {
    try {
      const categories = await blogPostService.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('BlogPost getCategories error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};