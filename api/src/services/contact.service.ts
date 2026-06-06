import { PrismaClient } from '@prisma/client';
import { ClientContactInput, RecruiterContactInput, FormOrigin } from '@jsoft/shared';
import { NotFoundError } from '../utils/errors.js';

const prisma = new PrismaClient();

const CONTACT_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  whatsapp: true,
  email: true,
  message: true,
  source: true,
  originType: true,
  readAt: true,
  archived: true,
  starred: true,
  labels: true,
  createdAt: true,
};

export interface ContactFilterInput {
  originType?: FormOrigin;
  page?: number;
  limit?: number;
  search?: string;
  isRead?: boolean;
  isArchived?: boolean;
  isStarred?: boolean;
  label?: string;
}

export const contactService = {
  async createClientContact(data: ClientContactInput, source: string) {
    return prisma.contactForm.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        whatsapp: data.whatsapp,
        email: data.email,
        message: data.message,
        source: source || 'general',
        originType: 'CLIENT',
      },
      select: CONTACT_SELECT,
    });
  },

  async createRecruiterContact(data: RecruiterContactInput) {
    return prisma.contactForm.create({
      data: {
        firstName: data.firstName,
        email: data.email,
        whatsapp: data.whatsapp,
        message: data.message,
        source: 'recruiter',
        originType: 'RECRUITER',
      },
      select: CONTACT_SELECT,
    });
  },

  async findAll(filter?: ContactFilterInput) {
    const { originType, page = 1, limit = 10, search, isRead, isArchived, isStarred, label } = filter || {};
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      ...(originType && { originType }),
      ...(isRead !== undefined && { readAt: isRead ? { not: null } : null }),
      ...(isArchived !== undefined && { archived: isArchived }),
      ...(isStarred !== undefined && { starred: isStarred }),
      ...(label && { labels: { has: label } }),
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contactForm.findMany({
        where,
        select: CONTACT_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contactForm.count({ where }),
    ]);

    return {
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Get a single contact form by ID
   */
  async findById(id: string) {
    return prisma.contactForm.findUnique({
      where: { id },
      select: CONTACT_SELECT,
    });
  },

  /**
   * Delete a contact form
   */
  async delete(id: string) {
    return prisma.contactForm.delete({
      where: { id },
    });
  },

  /**
   * Mark a contact form as read
   */
  async markRead(id: string) {
    return prisma.contactForm.update({
      where: { id },
      data: { readAt: new Date() },
      select: { id: true, readAt: true },
    });
  },

  /**
   * Toggle archive status of a contact form
   */
  async toggleArchive(id: string) {
    const current = await prisma.contactForm.findUnique({ where: { id }, select: { archived: true } });
    if (!current) throw new NotFoundError('Contact form not found');
    return prisma.contactForm.update({
      where: { id },
      data: { archived: !current.archived },
      select: { id: true, archived: true },
    });
  },

  /**
   * Toggle starred status of a contact form
   */
  async toggleStar(id: string) {
    const current = await prisma.contactForm.findUnique({ where: { id }, select: { starred: true } });
    if (!current) throw new NotFoundError('Contact form not found');
    return prisma.contactForm.update({
      where: { id },
      data: { starred: !current.starred },
      select: { id: true, starred: true },
    });
  },

  /**
   * Set labels on a contact form
   */
  async setLabels(id: string, labels: string[]) {
    return prisma.contactForm.update({
      where: { id },
      data: { labels },
      select: { id: true, labels: true },
    });
  },

  /**
   * Get contact statistics
   */
  async getStats() {
    const [total, clientCount, recruiterCount, recentCount] = await Promise.all([
      prisma.contactForm.count(),
      prisma.contactForm.count({ where: { originType: 'CLIENT' } }),
      prisma.contactForm.count({ where: { originType: 'RECRUITER' } }),
      prisma.contactForm.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    return {
      total,
      clientCount,
      recruiterCount,
      recentCount,
    };
  },
};
