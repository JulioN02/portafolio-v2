import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { contactService } from '../services/contact.service.js';
import { clientContactSchema, recruiterContactSchema, FormOrigin } from '@jsoft/shared';

export const contactController = {
  /**
   * POST /api/contact/client
   * Submit a contact form from a client
   */
  async createClient(req: Request, res: Response): Promise<void> {
    try {
      const data = clientContactSchema.parse(req.body);
      const source = req.body.source || 'general';
      
      const contact = await contactService.createClientContact(data, source);
      
      res.status(201).json({
        message: 'Contact form submitted successfully',
        data: contact,
      });
    } catch (error) {
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
  async createRecruiter(req: Request, res: Response): Promise<void> {
    try {
      const data = recruiterContactSchema.parse(req.body);
      
      const contact = await contactService.createRecruiterContact(data);
      
      res.status(201).json({
        message: 'Contact form submitted successfully',
        data: contact,
      });
    } catch (error) {
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
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const originType = req.query.originType as FormOrigin | undefined;
      
      const result = await contactService.findAll({ page, limit, originType });
      
      res.json(result);
    } catch (error) {
      console.error('Find all contacts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * GET /api/contact/:id
   * Get a single contact form (admin only)
   */
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      
      const contact = await contactService.findById(id);
      
      if (!contact) {
        res.status(404).json({ error: 'Contact form not found' });
        return;
      }
      
      res.json(contact);
    } catch (error) {
      console.error('Find contact by id error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * DELETE /api/contact/:id
   * Delete a contact form (admin only)
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      
      const existing = await contactService.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Contact form not found' });
        return;
      }
      
      await contactService.delete(id);
      
      res.json({ message: 'Contact form deleted successfully' });
    } catch (error) {
      console.error('Delete contact error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * GET /api/contact/stats/summary
   * Get contact statistics (admin only)
   */
  async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await contactService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Get contact stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
