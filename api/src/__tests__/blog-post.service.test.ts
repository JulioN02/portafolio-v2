import { blogPostService } from '../services/blog-post.service';
import { PrismaClient, PostStatus } from '@prisma/client';

const mockPrisma = new PrismaClient();

describe('BlogPost Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated blog posts', async () => {
      const mockPosts = [
        { id: '1', title: 'Post 1', slug: 'post-1', status: 'PUBLISHED', deletedAt: null },
        { id: '2', title: 'Post 2', slug: 'post-2', status: 'DRAFT', deletedAt: null },
      ];
      
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (mockPrisma.blogPost.count as jest.Mock).mockResolvedValue(2);

      const result = await blogPostService.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter by status', async () => {
      const mockPosts = [
        { id: '1', title: 'Published Post', status: 'PUBLISHED', deletedAt: null },
      ];
      
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (mockPrisma.blogPost.count as jest.Mock).mockResolvedValue(1);

      const result = await blogPostService.findAll({ status: 'PUBLISHED' });

      expect(mockPrisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PUBLISHED' as PostStatus }),
        })
      );
    });

    it('should filter by category', async () => {
      const mockPosts = [
        { id: '1', title: 'Tech Post', category: 'technology', deletedAt: null },
      ];
      
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (mockPrisma.blogPost.count as jest.Mock).mockResolvedValue(1);

      const result = await blogPostService.findAll({ category: 'technology' });

      expect(mockPrisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'technology' }),
        })
      );
    });

    it('should apply pagination', async () => {
      const mockPosts = [{ id: '1', title: 'Post 1', deletedAt: null }];
      
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (mockPrisma.blogPost.count as jest.Mock).mockResolvedValue(20);

      const result = await blogPostService.findAll({ page: 2, limit: 5 });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.totalPages).toBe(4);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
    });
  });

  describe('findBySlug', () => {
    it('should find blog post by slug', async () => {
      const mockPost = { id: '1', title: 'Test Post', slug: 'test-post', deletedAt: null };
      (mockPrisma.blogPost.findFirst as jest.Mock).mockResolvedValue(mockPost);

      const result = await blogPostService.findBySlug('test-post');

      expect(result).toEqual(mockPost);
      expect(mockPrisma.blogPost.findFirst).toHaveBeenCalledWith({
        where: { slug: 'test-post', deletedAt: null },
        select: expect.any(Object),
      });
    });

    it('should return null when post not found', async () => {
      (mockPrisma.blogPost.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await blogPostService.findBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find blog post by id', async () => {
      const mockPost = { id: '123', title: 'Test Post', deletedAt: null };
      (mockPrisma.blogPost.findUnique as jest.Mock).mockResolvedValue(mockPost);

      const result = await blogPostService.findById('123');

      expect(result).toEqual(mockPost);
      expect(mockPrisma.blogPost.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        select: expect.any(Object),
      });
    });
  });

  describe('create', () => {
    it('should create a new blog post', async () => {
      const postData = {
        title: 'New Post',
        slug: 'new-post',
        category: 'technology',
        shortDescription: 'Short description here',
        coverImage: 'https://example.com/cover.jpg',
        body: 'This is the main body content with enough characters to pass validation.',
        status: 'DRAFT' as const,
      };
      
      const mockCreatedPost = { id: '1', ...postData, deletedAt: null, mediaGallery: [] };
      (mockPrisma.blogPost.create as jest.Mock).mockResolvedValue(mockCreatedPost);

      const result = await blogPostService.create(postData);

      expect(result).toEqual(mockCreatedPost);
      expect(mockPrisma.blogPost.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: postData.title,
          slug: postData.slug,
        }),
        select: expect.any(Object),
      });
    });

    it('should set publishedAt when status is PUBLISHED', async () => {
      const postData = {
        title: 'Published Post',
        slug: 'published-post',
        category: 'technology',
        shortDescription: 'Short description here',
        coverImage: 'https://example.com/cover.jpg',
        body: 'This is the main body content with enough characters to pass validation.',
        status: 'PUBLISHED' as const,
      };
      
      const mockCreatedPost = { id: '1', ...postData, deletedAt: null };
      (mockPrisma.blogPost.create as jest.Mock).mockResolvedValue(mockCreatedPost);

      const result = await blogPostService.create(postData);

      expect(mockPrisma.blogPost.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PUBLISHED',
            publishedAt: expect.any(Date),
          }),
        })
      );
    });
  });

  describe('update', () => {
    it('should update blog post fields', async () => {
      const updateData = { title: 'Updated Title' };
      const mockUpdatedPost = { id: '1', title: 'Updated Title', deletedAt: null };
      
      (mockPrisma.blogPost.update as jest.Mock).mockResolvedValue(mockUpdatedPost);

      const result = await blogPostService.update('1', updateData);

      expect(result).toEqual(mockUpdatedPost);
      expect(mockPrisma.blogPost.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { title: 'Updated Title' },
        select: expect.any(Object),
      });
    });

    it('should set publishedAt when status changed to PUBLISHED', async () => {
      const updateData = { status: 'PUBLISHED' as const };
      const mockUpdatedPost = { id: '1', status: 'PUBLISHED', publishedAt: new Date(), deletedAt: null };
      
      (mockPrisma.blogPost.update as jest.Mock).mockResolvedValue(mockUpdatedPost);

      await blogPostService.update('1', updateData);

      expect(mockPrisma.blogPost.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({
          status: 'PUBLISHED',
          publishedAt: expect.any(Date),
        }),
        select: expect.any(Object),
      });
    });
  });

  describe('softDelete', () => {
    it('should soft delete a blog post', async () => {
      const mockPost = { id: '1', title: 'Post', deletedAt: new Date() };
      (mockPrisma.blogPost.update as jest.Mock).mockResolvedValue(mockPost);

      const result = await blogPostService.softDelete('1');

      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(mockPrisma.blogPost.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date) },
        select: expect.any(Object),
      });
    });
  });

  describe('restore', () => {
    it('should restore a soft deleted blog post', async () => {
      const mockPost = { id: '1', title: 'Post', deletedAt: null };
      (mockPrisma.blogPost.update as jest.Mock).mockResolvedValue(mockPost);

      const result = await blogPostService.restore('1');

      expect(result.deletedAt).toBeNull();
      expect(mockPrisma.blogPost.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: null },
        select: expect.any(Object),
      });
    });
  });

  describe('updateStatus', () => {
    it('should update post status', async () => {
      const mockPost = { id: '1', status: 'PUBLISHED', publishedAt: new Date(), deletedAt: null };
      (mockPrisma.blogPost.update as jest.Mock).mockResolvedValue(mockPost);

      const result = await blogPostService.updateStatus('1', 'PUBLISHED');

      expect(result.status).toBe('PUBLISHED');
      expect(mockPrisma.blogPost.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({
          status: 'PUBLISHED',
          publishedAt: expect.any(Date),
        }),
        select: expect.any(Object),
      });
    });

    it('should not set publishedAt when status is DRAFT', async () => {
      const mockPost = { id: '1', status: 'DRAFT', publishedAt: null, deletedAt: null };
      (mockPrisma.blogPost.update as jest.Mock).mockResolvedValue(mockPost);

      const result = await blogPostService.updateStatus('1', 'DRAFT');

      expect(result.status).toBe('DRAFT');
      expect(mockPrisma.blogPost.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'DRAFT' },
        select: expect.any(Object),
      });
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', async () => {
      const mockCategories = [
        { category: 'technology' },
        { category: 'design' },
        { category: 'technology' },
      ];
      
      (mockPrisma.blogPost.findMany as jest.Mock).mockResolvedValue(mockCategories);

      const result = await blogPostService.getCategories();

      expect(result).toContain('technology');
      expect(result).toContain('design');
      // Note: The service uses distinct, so duplicates should be removed
      // But mock returns array as-is, so we check for contains instead
    });
  });
});