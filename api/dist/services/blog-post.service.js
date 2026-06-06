import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const BLOG_POST_SELECT = {
    id: true,
    title: true,
    slug: true,
    category: true,
    shortDescription: true,
    coverImage: true,
    mediaGallery: true,
    body: true,
    externalLink: true,
    lessonsLearned: true,
    status: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
    publishedAt: true,
};
export const blogPostService = {
    async findAll(filter) {
        const { status, category, page = 1, limit = 10 } = filter || {};
        const skip = (page - 1) * limit;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where = {
            deletedAt: null,
            ...(status && { status: status }),
            ...(category && { category }),
        };
        if (filter?.search) {
            where.OR = [
                { title: { contains: filter.search, mode: 'insensitive' } },
                { shortDescription: { contains: filter.search, mode: 'insensitive' } },
                { body: { contains: filter.search, mode: 'insensitive' } },
            ];
        }
        const [posts, total] = await Promise.all([
            prisma.blogPost.findMany({
                where,
                select: BLOG_POST_SELECT,
                orderBy: [{ createdAt: 'desc' }],
                skip,
                take: limit,
            }),
            prisma.blogPost.count({ where }),
        ]);
        return {
            data: posts,
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
        return prisma.blogPost.findFirst({
            where: { slug, deletedAt: null },
            select: BLOG_POST_SELECT,
        });
    },
    async findById(id) {
        return prisma.blogPost.findUnique({
            where: { id },
            select: BLOG_POST_SELECT,
        });
    },
    async create(data) {
        return prisma.blogPost.create({
            data: {
                title: data.title,
                slug: data.slug,
                category: data.category,
                shortDescription: data.shortDescription,
                coverImage: data.coverImage,
                mediaGallery: data.mediaGallery || [],
                body: data.body,
                externalLink: data.externalLink,
                lessonsLearned: data.lessonsLearned,
                status: data.status || 'DRAFT',
                ...(data.status === 'PUBLISHED' && { publishedAt: new Date() }),
            },
            select: BLOG_POST_SELECT,
        });
    },
    async update(id, data) {
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.slug !== undefined)
            updateData.slug = data.slug;
        if (data.category !== undefined)
            updateData.category = data.category;
        if (data.shortDescription !== undefined)
            updateData.shortDescription = data.shortDescription;
        if (data.coverImage !== undefined)
            updateData.coverImage = data.coverImage;
        if (data.mediaGallery !== undefined)
            updateData.mediaGallery = data.mediaGallery;
        if (data.body !== undefined)
            updateData.body = data.body;
        if (data.externalLink !== undefined)
            updateData.externalLink = data.externalLink;
        if (data.lessonsLearned !== undefined)
            updateData.lessonsLearned = data.lessonsLearned;
        if (data.status !== undefined) {
            updateData.status = data.status;
            if (data.status === 'PUBLISHED') {
                updateData.publishedAt = new Date();
            }
        }
        return prisma.blogPost.update({
            where: { id },
            data: updateData,
            select: BLOG_POST_SELECT,
        });
    },
    async softDelete(id) {
        return prisma.blogPost.update({
            where: { id },
            data: { deletedAt: new Date() },
            select: BLOG_POST_SELECT,
        });
    },
    async restore(id) {
        return prisma.blogPost.update({
            where: { id },
            data: { deletedAt: null },
            select: BLOG_POST_SELECT,
        });
    },
    async reorder(id, _newOrder) {
        // Note: BlogPost model doesn't have an order field in Prisma schema
        // This function is kept for API consistency but would need schema modification
        return prisma.blogPost.findUnique({
            where: { id },
            select: BLOG_POST_SELECT,
        });
    },
    async updateStatus(id, status) {
        const updateData = { status };
        if (status === 'PUBLISHED') {
            updateData.publishedAt = new Date();
        }
        return prisma.blogPost.update({
            where: { id },
            data: updateData,
            select: BLOG_POST_SELECT,
        });
    },
    async getCategories() {
        const result = await prisma.blogPost.findMany({
            where: { deletedAt: null },
            select: { category: true },
            distinct: ['category'],
            orderBy: { category: 'asc' },
        });
        return result.map((item) => item.category);
    },
};
//# sourceMappingURL=blog-post.service.js.map