import { PrismaClient } from '@prisma/client';
import { SiteSectionUpdateInput, SiteSectionReorderInput } from '@jsoft/shared';

const prisma = new PrismaClient();

const SITE_SECTION_SELECT = {
  id: true,
  key: true,
  label: true,
  visible: true,
  order: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const siteSectionService = {
  async findAll() {
    return prisma.siteSection.findMany({
      select: SITE_SECTION_SELECT,
      orderBy: [{ order: 'asc' }],
    });
  },

  async findById(id: string) {
    return prisma.siteSection.findUnique({
      where: { id },
      select: SITE_SECTION_SELECT,
    });
  },

  async reorder(data: SiteSectionReorderInput) {
    await prisma.$transaction(
      data.sections.map((section) =>
        prisma.siteSection.update({
          where: { id: section.id },
          data: { order: section.order },
        })
      )
    );

    return prisma.siteSection.findMany({
      select: SITE_SECTION_SELECT,
      orderBy: [{ order: 'asc' }],
    });
  },

  async update(id: string, data: SiteSectionUpdateInput) {
    return prisma.siteSection.update({
      where: { id },
      data: {
        ...(data.visible !== undefined && { visible: data.visible }),
        ...(data.label !== undefined && { label: data.label }),
      },
      select: SITE_SECTION_SELECT,
    });
  },
};
