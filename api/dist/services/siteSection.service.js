import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const SITE_SECTION_SELECT = {
    id: true,
    key: true,
    label: true,
    visible: true,
    order: true,
    createdAt: true,
    updatedAt: true,
};
export const siteSectionService = {
    async findAll() {
        return prisma.siteSection.findMany({
            select: SITE_SECTION_SELECT,
            orderBy: [{ order: 'asc' }],
        });
    },
    async findById(id) {
        return prisma.siteSection.findUnique({
            where: { id },
            select: SITE_SECTION_SELECT,
        });
    },
    async reorder(data) {
        await prisma.$transaction(data.sections.map((section) => prisma.siteSection.update({
            where: { id: section.id },
            data: { order: section.order },
        })));
        return prisma.siteSection.findMany({
            select: SITE_SECTION_SELECT,
            orderBy: [{ order: 'asc' }],
        });
    },
    async update(id, data) {
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
//# sourceMappingURL=siteSection.service.js.map