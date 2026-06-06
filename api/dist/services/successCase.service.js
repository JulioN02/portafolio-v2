import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const SUCCESS_CASE_SELECT = {
    id: true,
    title: true,
    slug: true,
    description: true,
    images: true,
    videos: true,
    links: true,
    status: true,
    publishedAt: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
};
export const successCaseService = {
    async findAll(filter) {
        const { status, page = 1, limit = 10 } = filter || {};
        const skip = (page - 1) * limit;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where = {
            deletedAt: null,
            ...(status && { status: status }),
        };
        const [successCases, total] = await Promise.all([
            prisma.successCase.findMany({
                where,
                select: SUCCESS_CASE_SELECT,
                orderBy: [{ createdAt: 'desc' }],
                skip,
                take: limit,
            }),
            prisma.successCase.count({ where }),
        ]);
        return {
            data: successCases,
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
        return prisma.successCase.findFirst({
            where: { slug, deletedAt: null },
            select: SUCCESS_CASE_SELECT,
        });
    },
    async findRecent(limit = 3) {
        return prisma.successCase.findMany({
            where: { deletedAt: null },
            select: SUCCESS_CASE_SELECT,
            orderBy: [{ createdAt: 'desc' }],
            take: limit,
        });
    },
    async findById(id) {
        return prisma.successCase.findUnique({
            where: { id },
            select: SUCCESS_CASE_SELECT,
        });
    },
    async create(data) {
        return prisma.successCase.create({
            data: {
                title: data.title,
                slug: data.slug,
                description: data.description,
                images: data.images,
                videos: data.videos ?? [],
                links: data.links ?? [],
                status: data.status || 'DRAFT',
                ...(data.status === 'PUBLISHED' && { publishedAt: new Date() }),
            },
            select: SUCCESS_CASE_SELECT,
        });
    },
    async update(id, data) {
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.slug !== undefined)
            updateData.slug = data.slug;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.images !== undefined)
            updateData.images = data.images;
        if (data.videos !== undefined)
            updateData.videos = data.videos;
        if (data.links !== undefined)
            updateData.links = data.links;
        if (data.status !== undefined) {
            updateData.status = data.status;
            if (data.status === 'PUBLISHED') {
                updateData.publishedAt = new Date();
            }
        }
        return prisma.successCase.update({
            where: { id },
            data: updateData,
            select: SUCCESS_CASE_SELECT,
        });
    },
    async softDelete(id) {
        return prisma.successCase.update({
            where: { id },
            data: { deletedAt: new Date() },
            select: SUCCESS_CASE_SELECT,
        });
    },
    async restore(id) {
        return prisma.successCase.update({
            where: { id },
            data: { deletedAt: null },
            select: SUCCESS_CASE_SELECT,
        });
    },
    async updateStatus(id, status) {
        const updateData = { status };
        if (status === 'PUBLISHED') {
            updateData.publishedAt = new Date();
        }
        return prisma.successCase.update({
            where: { id },
            data: updateData,
            select: SUCCESS_CASE_SELECT,
        });
    },
};
//# sourceMappingURL=successCase.service.js.map