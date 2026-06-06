import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const projectsService = {
    async findAll(filter) {
        const { page = 1, limit = 10, classification, type } = filter || {};
        const skip = (page - 1) * limit;
        // Build queries based on filters
        const queries = [];
        if (!type || type === 'service') {
            queries.push(prisma.service.findMany({
                where: {
                    deletedAt: null,
                    ...(classification && { classification }),
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    classification: true,
                    shortDescription: true,
                    images: true,
                    createdAt: true,
                },
                orderBy: [{ createdAt: 'desc' }],
            }).then(items => items.map(item => ({
                id: item.id,
                title: item.title,
                slug: item.slug,
                classification: item.classification,
                shortDescription: item.shortDescription,
                createdAt: item.createdAt,
                type: 'service',
                image: item.images[0] || '',
            }))));
        }
        if (!type || type === 'product') {
            queries.push(prisma.product.findMany({
                where: {
                    deletedAt: null,
                    ...(classification && { classification }),
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    classification: true,
                    shortDescription: true,
                    images: true,
                    featured: true,
                    createdAt: true,
                },
                orderBy: [{ createdAt: 'desc' }],
            }).then(items => items.map(item => ({
                id: item.id,
                title: item.title,
                slug: item.slug,
                classification: item.classification,
                shortDescription: item.shortDescription,
                createdAt: item.createdAt,
                featured: item.featured,
                type: 'product',
                image: item.images[0] || '',
            }))));
        }
        if (!type || type === 'tool') {
            queries.push(prisma.tool.findMany({
                where: {
                    deletedAt: null,
                    ...(classification && { classification }),
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    classification: true,
                    shortDescription: true,
                    images: true,
                    featured: true,
                    createdAt: true,
                },
                orderBy: [{ createdAt: 'desc' }],
            }).then(items => items.map(item => ({
                id: item.id,
                title: item.title,
                slug: item.slug,
                classification: item.classification,
                shortDescription: item.shortDescription,
                createdAt: item.createdAt,
                featured: item.featured,
                type: 'tool',
                image: item.images[0] || '',
            }))));
        }
        if (!type || type === 'successCase') {
            queries.push(prisma.successCase.findMany({
                where: {
                    deletedAt: null,
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    description: true,
                    images: true,
                    createdAt: true,
                },
                orderBy: [{ createdAt: 'desc' }],
            }).then(items => items.map(item => ({
                id: item.id,
                title: item.title,
                slug: item.slug,
                classification: 'success-case',
                shortDescription: item.description,
                createdAt: item.createdAt,
                type: 'successCase',
                image: item.images[0] || '',
            }))));
        }
        // Execute all queries in parallel
        const results = await Promise.all(queries);
        // Merge and sort all results by createdAt
        const allProjects = results.flat()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        // Apply pagination
        const total = allProjects.length;
        const paginatedProjects = allProjects.slice(skip, skip + limit);
        return {
            data: paginatedProjects,
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
    async findRecent(limit = 3) {
        const recentSelect = {
            id: true, title: true, slug: true, classification: true,
            shortDescription: true, images: true, createdAt: true,
        };
        const productSelect = {
            id: true, title: true, slug: true, classification: true,
            shortDescription: true, images: true, featured: true, createdAt: true,
        };
        const toolSelect = {
            id: true, title: true, slug: true, classification: true,
            shortDescription: true, images: true, featured: true, createdAt: true,
        };
        const successCaseSelect = {
            id: true, title: true, slug: true, description: true,
            images: true, createdAt: true,
        };
        const [services, products, tools, successCases] = await Promise.all([
            prisma.service.findMany({
                where: { deletedAt: null },
                select: recentSelect,
                orderBy: [{ createdAt: 'desc' }],
                take: limit,
            }).then(items => items.map(item => ({
                id: item.id,
                title: item.title,
                slug: item.slug,
                classification: item.classification,
                shortDescription: item.shortDescription,
                createdAt: item.createdAt,
                type: 'service',
                image: item.images[0] || '',
            }))),
            prisma.product.findMany({
                where: { deletedAt: null },
                select: productSelect,
                orderBy: [{ createdAt: 'desc' }],
                take: limit,
            }).then(items => items.map(item => ({
                id: item.id,
                title: item.title,
                slug: item.slug,
                classification: item.classification,
                shortDescription: item.shortDescription,
                createdAt: item.createdAt,
                featured: item.featured,
                type: 'product',
                image: item.images[0] || '',
            }))),
            prisma.tool.findMany({
                where: { deletedAt: null },
                select: toolSelect,
                orderBy: [{ createdAt: 'desc' }],
                take: limit,
            }).then(items => items.map(item => ({
                id: item.id,
                title: item.title,
                slug: item.slug,
                classification: item.classification,
                shortDescription: item.shortDescription,
                createdAt: item.createdAt,
                featured: item.featured,
                type: 'tool',
                image: item.images[0] || '',
            }))),
            prisma.successCase.findMany({
                where: { deletedAt: null },
                select: successCaseSelect,
                orderBy: [{ createdAt: 'desc' }],
                take: limit,
            }).then(items => items.map(item => ({
                id: item.id,
                title: item.title,
                slug: item.slug,
                classification: 'success-case',
                shortDescription: item.description,
                createdAt: item.createdAt,
                type: 'successCase',
                image: item.images[0] || '',
            }))),
        ]);
        // Merge all and sort by createdAt, then take the top N
        const allRecent = [...services, ...products, ...tools, ...successCases]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
        return allRecent;
    },
    async getClassifications() {
        const [serviceClassifications, productClassifications, toolClassifications] = await Promise.all([
            prisma.service.findMany({
                where: { deletedAt: null },
                select: { classification: true },
                distinct: ['classification'],
            }).then(items => items.map(i => i.classification)),
            prisma.product.findMany({
                where: { deletedAt: null },
                select: { classification: true },
                distinct: ['classification'],
            }).then(items => items.map(i => i.classification)),
            prisma.tool.findMany({
                where: { deletedAt: null },
                select: { classification: true },
                distinct: ['classification'],
            }).then(items => items.map(i => i.classification)),
        ]);
        // Merge and dedupe
        const allClassifications = [...new Set([
                ...serviceClassifications,
                ...productClassifications,
                ...toolClassifications,
            ])].sort();
        return allClassifications;
    },
};
//# sourceMappingURL=projects.service.js.map