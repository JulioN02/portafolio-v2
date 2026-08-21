import { Request, Response } from 'express';
import { z } from 'zod';
import { contactService } from '../services/contact.service.js';
import { clientContactSchema, recruiterContactSchema, FormOrigin } from '@jsoft/shared';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

export const contactController = {
  /**
   * POST /api/contact/client
   * Submit a contact form from a client
   */
  createClient: asyncHandler(async (req: Request, res: Response) => {
    const data = clientContactSchema.parse(req.body);
    const source = req.body.source || 'general';

    const contact = await contactService.createClientContact(data, source);

    res.status(201).json({
      message: 'Contact form submitted successfully',
      data: contact,
    });
  }),

  /**
   * POST /api/contact/recruiter
   * Submit a contact form from a recruiter
   */
  createRecruiter: asyncHandler(async (req: Request, res: Response) => {
    const data = recruiterContactSchema.parse(req.body);

    const contact = await contactService.createRecruiterContact(data);

    res.status(201).json({
      message: 'Contact form submitted successfully',
      data: contact,
    });
  }),

  /**
   * GET /api/contact
   * Get all contact forms (admin only)
   */
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const originType = req.query.originType as FormOrigin | undefined;
    const search = req.query.search as string | undefined;
    const isRead = req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined;
    const isArchived = req.query.isArchived !== undefined ? req.query.isArchived === 'true' : undefined;
    const isStarred = req.query.isStarred !== undefined ? req.query.isStarred === 'true' : undefined;
    const label = req.query.label as string | undefined;

    const result = await contactService.findAll({ page, limit, originType, search, isRead, isArchived, isStarred, label });

    res.json(result);
  }),

  /**
   * GET /api/contact/:id
   * Get a single contact form (admin only)
   */
  findById: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const contact = await contactService.findById(id);

    if (!contact) {
      throw new NotFoundError('Contact form not found');
    }

    res.json(contact);
  }),

  /**
   * DELETE /api/contact/:id
   * Delete a contact form (admin only)
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const existing = await contactService.findById(id);
    if (!existing) {
      throw new NotFoundError('Contact form not found');
    }

    await contactService.delete(id);

    res.json({ message: 'Contact form deleted successfully' });
  }),

  /**
   * PATCH /api/contact/:id/read
   * Mark a contact form as read (admin only)
   */
  markRead: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await contactService.markRead(id);

    res.json(result);
  }),

  /**
   * PATCH /api/contact/:id/archive
   * Toggle archive status of a contact form (admin only)
   */
  toggleArchive: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await contactService.toggleArchive(id);

    res.json(result);
  }),

  /**
   * PATCH /api/contact/:id/star
   * Toggle starred status of a contact form (admin only)
   */
  toggleStar: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await contactService.toggleStar(id);

    res.json(result);
  }),

  /**
   * POST /api/contact/:id/labels
   * Set labels on a contact form (admin only)
   */
  setLabels: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const labels = z.array(z.string()).parse(req.body.labels);
    const result = await contactService.setLabels(id, labels);

    res.json(result);
  }),

  /**
   * GET /api/contact/stats/summary
   * Get contact statistics (admin only)
   */
  getStats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await contactService.getStats();
    res.json(stats);
  }),
};