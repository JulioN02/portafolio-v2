import { PrismaClient } from '@prisma/client';
import { ClientContactInput, RecruiterContactInput, FormOrigin } from '@jsoft/shared';

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
  createdAt: true,
};

export interface ContactFilterInput {
  originType?: FormOrigin;
  page?: number;
  limit?: number;
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
    const { originType, page = 1, limit = 10 } = filter || {};
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      ...(originType && { originType }),
    };

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
