import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const SERVICE_SELECT = {
    id: true,
    title: true,
    slug: true,
    classification: true,
    shortDescription: true,
    fullDescription: true,
    includedItems: true,
    images: true,
    status: true,
    publishedAt: true,
    deletedAt: true,
    technicalExplanation: true,
    technicalImages: true,
    createdAt: true,
    updatedAt: true,
};
export const serviceService = {
    async findAll(filter) {
        const { status, classification, page = 1, limit = 10 } = filter || {};
        const skip = (page - 1) * limit;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where = {
            deletedAt: null,
            ...(status && { status: status }),
            ...(classification && { classification }),
        };
        const [services, total] = await Promise.all([
            prisma.service.findMany({
                where,
                select: SERVICE_SELECT,
                orderBy: [{ createdAt: 'desc' }],
                skip,
                take: limit,
            }),
            prisma.service.count({ where }),
        ]);
        return {
            data: services,
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
    async findBySlug(slug) {
        return prisma.service.findFirst({
            where: { slug, deletedAt: null },
            select: SERVICE_SELECT,
        });
    },
    async findById(id) {
        return prisma.service.findUnique({
            where: { id },
            select: SERVICE_SELECT,
        });
    },
    async create(data) {
        return prisma.service.create({
            data: {
                title: data.title,
                slug: data.slug,
                classification: data.classification,
                shortDescription: data.shortDescription,
                fullDescription: data.fullDescription,
                includedItems: data.includedItems,
                images: data.images,
                status: data.status || 'DRAFT',
                ...(data.status === 'PUBLISHED' && { publishedAt: new Date() }),
                technicalExplanation: data.technicalExplanation,
                technicalImages: data.technicalImages,
            },
            select: SERVICE_SELECT,
        });
    },
    async update(id, data) {
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.slug !== undefined)
            updateData.slug = data.slug;
        if (data.classification !== undefined)
            updateData.classification = data.classification;
        if (data.shortDescription !== undefined)
            updateData.shortDescription = data.shortDescription;
        if (data.fullDescription !== undefined)
            updateData.fullDescription = data.fullDescription;
        if (data.includedItems !== undefined)
            updateData.includedItems = data.includedItems;
        if (data.images !== undefined)
            updateData.images = data.images;
        if (data.status !== undefined) {
            updateData.status = data.status;
            if (data.status === 'PUBLISHED') {
                updateData.publishedAt = new Date();
            }
        }
        if (data.technicalExplanation !== undefined)
            updateData.technicalExplanation = data.technicalExplanation;
        if (data.technicalImages !== undefined)
            updateData.technicalImages = data.technicalImages;
        return prisma.service.update({
            where: { id },
            data: updateData,
            select: SERVICE_SELECT,
        });
    },
    async softDelete(id) {
        return prisma.service.update({
            where: { id },
            data: { deletedAt: new Date() },
            select: SERVICE_SELECT,
        });
    },
    async restore(id) {
        return prisma.service.update({
            where: { id },
            data: { deletedAt: null },
            select: SERVICE_SELECT,
        });
    },
    async updateStatus(id, status) {
        const updateData = { status };
        if (status === 'PUBLISHED') {
            updateData.publishedAt = new Date();
        }
        return prisma.service.update({
            where: { id },
            data: updateData,
            select: SERVICE_SELECT,
        });
    },
    async getClassifications() {
        const result = await prisma.service.findMany({
            where: { deletedAt: null },
            select: { classification: true },
            distinct: ['classification'],
            orderBy: { classification: 'asc' },
        });
        return result.map((item) => item.classification);
    },
};
//# sourceMappingURL=service.service.js.map