import { contactService } from '../services/contact.service';
import { PrismaClient } from '@prisma/client';

const mockPrisma = new PrismaClient();

const baseContact = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  whatsapp: null,
  email: 'john@example.com',
  message: 'Hello',
  source: 'general',
  originType: 'CLIENT' as const,
  readAt: null,
  archived: false,
  starred: false,
  labels: [] as string[],
  createdAt: new Date(),
};

describe('Contact Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── findAll ──

  describe('findAll', () => {
    it('should return paginated contacts', async () => {
      mockPrisma.contactForm.findMany.mockResolvedValue([baseContact]);
      mockPrisma.contactForm.count.mockResolvedValue(1);

      const result = await contactService.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter by originType', async () => {
      mockPrisma.contactForm.findMany.mockResolvedValue([baseContact]);
      mockPrisma.contactForm.count.mockResolvedValue(1);

      await contactService.findAll({ originType: 'CLIENT' });

      expect(mockPrisma.contactForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ originType: 'CLIENT' }),
        }),
      );
    });

    it('should filter by isRead=true (readAt not null)', async () => {
      mockPrisma.contactForm.findMany.mockResolvedValue([]);
      mockPrisma.contactForm.count.mockResolvedValue(0);

      await contactService.findAll({ isRead: true });

      expect(mockPrisma.contactForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            readAt: { not: null },
          }),
        }),
      );
    });

    it('should filter by isRead=false (readAt null)', async () => {
      mockPrisma.contactForm.findMany.mockResolvedValue([]);
      mockPrisma.contactForm.count.mockResolvedValue(0);

      await contactService.findAll({ isRead: false });

      expect(mockPrisma.contactForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ readAt: null }),
        }),
      );
    });

    it('should filter by isArchived', async () => {
      mockPrisma.contactForm.findMany.mockResolvedValue([]);
      mockPrisma.contactForm.count.mockResolvedValue(0);

      await contactService.findAll({ isArchived: true });

      expect(mockPrisma.contactForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ archived: true }),
        }),
      );
    });

    it('should filter by isStarred', async () => {
      mockPrisma.contactForm.findMany.mockResolvedValue([{ ...baseContact, starred: true }]);
      mockPrisma.contactForm.count.mockResolvedValue(1);

      const result = await contactService.findAll({ isStarred: true });

      expect(mockPrisma.contactForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ starred: true }),
        }),
      );
      expect(result.data[0].starred).toBe(true);
    });

    it('should filter by label', async () => {
      mockPrisma.contactForm.findMany.mockResolvedValue([]);
      mockPrisma.contactForm.count.mockResolvedValue(0);

      await contactService.findAll({ label: 'important' });

      expect(mockPrisma.contactForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            labels: { has: 'important' },
          }),
        }),
      );
    });

    it('should search across firstName, lastName, email, and message', async () => {
      mockPrisma.contactForm.findMany.mockResolvedValue([]);
      mockPrisma.contactForm.count.mockResolvedValue(0);

      await contactService.findAll({ search: 'john' });

      expect(mockPrisma.contactForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { firstName: { contains: 'john', mode: 'insensitive' } },
              { lastName: { contains: 'john', mode: 'insensitive' } },
              { email: { contains: 'john', mode: 'insensitive' } },
              { message: { contains: 'john', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should combine search with other filters via AND', async () => {
      mockPrisma.contactForm.findMany.mockResolvedValue([]);
      mockPrisma.contactForm.count.mockResolvedValue(0);

      await contactService.findAll({ search: 'john', originType: 'CLIENT', isRead: false });

      const callWhere = mockPrisma.contactForm.findMany.mock.calls[0][0].where;
      expect(callWhere.originType).toBe('CLIENT');
      expect(callWhere.readAt).toBeNull();
      expect(callWhere.OR).toBeDefined();
    });

    it('should apply pagination correctly', async () => {
      mockPrisma.contactForm.findMany.mockResolvedValue([]);
      mockPrisma.contactForm.count.mockResolvedValue(25);

      const result = await contactService.findAll({ page: 3, limit: 10 });

      expect(mockPrisma.contactForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
      expect(result.pagination.page).toBe(3);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(true);
    });

    it('should return correct hasNext/hasPrev for first page', async () => {
      mockPrisma.contactForm.findMany.mockResolvedValue(Array(10).fill(baseContact));
      mockPrisma.contactForm.count.mockResolvedValue(15);

      const result = await contactService.findAll({ page: 1, limit: 10 });

      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should use default page and limit when not provided', async () => {
      mockPrisma.contactForm.findMany.mockResolvedValue([]);
      mockPrisma.contactForm.count.mockResolvedValue(0);

      await contactService.findAll({});

      expect(mockPrisma.contactForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('should order by createdAt desc', async () => {
      mockPrisma.contactForm.findMany.mockResolvedValue([]);
      mockPrisma.contactForm.count.mockResolvedValue(0);

      await contactService.findAll({});

      expect(mockPrisma.contactForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  // ── findById ──

  describe('findById', () => {
    it('should return a contact by id', async () => {
      mockPrisma.contactForm.findUnique.mockResolvedValue(baseContact);

      const result = await contactService.findById('1');

      expect(mockPrisma.contactForm.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
      expect(result).toEqual(baseContact);
    });

    it('should return null when contact not found', async () => {
      mockPrisma.contactForm.findUnique.mockResolvedValue(null);

      const result = await contactService.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  // ── createClientContact ──

  describe('createClientContact', () => {
    it('should create a client contact with source', async () => {
      const input = {
        firstName: 'Jane',
        lastName: 'Smith',
        whatsapp: '1234567890',
        email: 'jane@example.com',
        message: 'I need a website',
      };
      const expected = { ...baseContact, id: '2', firstName: 'Jane' };
      mockPrisma.contactForm.create.mockResolvedValue(expected);

      const result = await contactService.createClientContact(input, 'landing-page');

      expect(mockPrisma.contactForm.create).toHaveBeenCalledWith({
        data: {
          firstName: 'Jane',
          lastName: 'Smith',
          whatsapp: '1234567890',
          email: 'jane@example.com',
          message: 'I need a website',
          source: 'landing-page',
          originType: 'CLIENT',
        },
        select: expect.any(Object),
      });
      expect(result.firstName).toBe('Jane');
    });

    it('should use default source when not provided', async () => {
      const input = {
        firstName: 'Jane',
        lastName: 'Smith',
        whatsapp: '1234567890',
        email: 'jane@example.com',
        message: 'I need a website',
      };
      mockPrisma.contactForm.create.mockResolvedValue(baseContact);

      await contactService.createClientContact(input, '');

      expect(mockPrisma.contactForm.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ source: 'general' }),
        }),
      );
    });
  });

  // ── createRecruiterContact ──

  describe('createRecruiterContact', () => {
    it('should create a recruiter contact', async () => {
      const input = {
        firstName: 'Recruiter',
        email: 'recruiter@company.com',
        whatsapp: '0987654321',
        message: 'Interesting profile',
      };
      const expected = { ...baseContact, id: '3', firstName: 'Recruiter', originType: 'RECRUITER' };
      mockPrisma.contactForm.create.mockResolvedValue(expected);

      const result = await contactService.createRecruiterContact(input);

      expect(mockPrisma.contactForm.create).toHaveBeenCalledWith({
        data: {
          firstName: 'Recruiter',
          email: 'recruiter@company.com',
          whatsapp: '0987654321',
          message: 'Interesting profile',
          source: 'recruiter',
          originType: 'RECRUITER',
        },
        select: expect.any(Object),
      });
      expect(result.originType).toBe('RECRUITER');
    });
  });

  // ── delete ──

  describe('delete', () => {
    it('should delete a contact by id', async () => {
      mockPrisma.contactForm.delete.mockResolvedValue(baseContact);

      const result = await contactService.delete('1');

      expect(mockPrisma.contactForm.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(baseContact);
    });
  });

  // ── markRead ──

  describe('markRead', () => {
    it('should set readAt on the contact', async () => {
      const updated = { id: '1', readAt: new Date() };
      mockPrisma.contactForm.update.mockResolvedValue(updated);

      const result = await contactService.markRead('1');

      expect(mockPrisma.contactForm.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { readAt: expect.any(Date) },
        select: { id: true, readAt: true },
      });
      expect(result.readAt).toBeDefined();
    });
  });

  // ── toggleArchive ──

  describe('toggleArchive', () => {
    it('should toggle archived from false to true', async () => {
      mockPrisma.contactForm.findUnique.mockResolvedValue({ archived: false });
      mockPrisma.contactForm.update.mockResolvedValue({ id: '1', archived: true });

      const result = await contactService.toggleArchive('1');

      expect(mockPrisma.contactForm.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { archived: true },
      });
      expect(mockPrisma.contactForm.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { archived: true },
        select: { id: true, archived: true },
      });
      expect(result.archived).toBe(true);
    });

    it('should toggle archived from true to false', async () => {
      mockPrisma.contactForm.findUnique.mockResolvedValue({ archived: true });
      mockPrisma.contactForm.update.mockResolvedValue({ id: '1', archived: false });

      const result = await contactService.toggleArchive('1');

      expect(mockPrisma.contactForm.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { archived: false },
        select: { id: true, archived: true },
      });
      expect(result.archived).toBe(false);
    });

    it('should throw NotFoundError when contact does not exist', async () => {
      mockPrisma.contactForm.findUnique.mockResolvedValue(null);

      await expect(contactService.toggleArchive('nonexistent')).rejects.toThrow(
        'Contact form not found',
      );
      expect(mockPrisma.contactForm.update).not.toHaveBeenCalled();
    });
  });

  // ── toggleStar ──

  describe('toggleStar', () => {
    it('should toggle starred from false to true', async () => {
      mockPrisma.contactForm.findUnique.mockResolvedValue({ starred: false });
      mockPrisma.contactForm.update.mockResolvedValue({ id: '1', starred: true });

      const result = await contactService.toggleStar('1');

      expect(mockPrisma.contactForm.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { starred: true },
      });
      expect(mockPrisma.contactForm.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { starred: true },
        select: { id: true, starred: true },
      });
      expect(result.starred).toBe(true);
    });

    it('should toggle starred from true to false', async () => {
      mockPrisma.contactForm.findUnique.mockResolvedValue({ starred: true });
      mockPrisma.contactForm.update.mockResolvedValue({ id: '1', starred: false });

      const result = await contactService.toggleStar('1');

      expect(mockPrisma.contactForm.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { starred: false },
        select: { id: true, starred: true },
      });
      expect(result.starred).toBe(false);
    });

    it('should throw NotFoundError when contact does not exist', async () => {
      mockPrisma.contactForm.findUnique.mockResolvedValue(null);

      await expect(contactService.toggleStar('nonexistent')).rejects.toThrow(
        'Contact form not found',
      );
      expect(mockPrisma.contactForm.update).not.toHaveBeenCalled();
    });
  });

  // ── setLabels ──

  describe('setLabels', () => {
    it('should set labels on a contact', async () => {
      const labels = ['important', 'follow-up'];
      const updated = { id: '1', labels };
      mockPrisma.contactForm.update.mockResolvedValue(updated);

      const result = await contactService.setLabels('1', labels);

      expect(mockPrisma.contactForm.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { labels },
        select: { id: true, labels: true },
      });
      expect(result.labels).toEqual(['important', 'follow-up']);
    });

    it('should set empty labels array', async () => {
      mockPrisma.contactForm.update.mockResolvedValue({ id: '1', labels: [] });

      const result = await contactService.setLabels('1', []);

      expect(mockPrisma.contactForm.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { labels: [] },
        select: { id: true, labels: true },
      });
      expect(result.labels).toEqual([]);
    });
  });

  // ── getStats ──

  describe('getStats', () => {
    it('should return aggregated statistics', async () => {
      mockPrisma.contactForm.count
        .mockResolvedValueOnce(100)  // total
        .mockResolvedValueOnce(60)   // clientCount
        .mockResolvedValueOnce(40)   // recruiterCount
        .mockResolvedValueOnce(10);  // recentCount

      const result = await contactService.getStats();

      expect(mockPrisma.contactForm.count).toHaveBeenCalledTimes(4);
      expect(result).toEqual({
        total: 100,
        clientCount: 60,
        recruiterCount: 40,
        recentCount: 10,
      });
    });

    it('should filter recent count to last 7 days', async () => {
      mockPrisma.contactForm.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(5);

      await contactService.getStats();

      expect(mockPrisma.contactForm.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        }),
      );
    });
  });
});
