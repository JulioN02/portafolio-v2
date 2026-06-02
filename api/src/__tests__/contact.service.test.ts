import { contactService } from '../services/contact.service';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    contactForm: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

const { PrismaClient } = jest.requireMock('@prisma/client');
const mockPrisma = new PrismaClient();

describe('Contact Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    const baseContact = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      whatsapp: null,
      email: 'john@example.com',
      message: 'Hello',
      source: 'general',
      originType: 'CLIENT',
      readAt: null,
      archived: false,
      starred: false,
      labels: [],
      createdAt: new Date(),
    };

    it('should filter by isStarred=true', async () => {
      const starredContact = { ...baseContact, id: '2', starred: true };
      mockPrisma.contactForm.findMany.mockResolvedValue([starredContact]);
      mockPrisma.contactForm.count.mockResolvedValue(1);

      const result = await contactService.findAll({ isStarred: true });

      expect(mockPrisma.contactForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ starred: true }),
        }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].starred).toBe(true);
    });

    it('should filter by isStarred=false', async () => {
      const unstarredContact = { ...baseContact, id: '3', starred: false };
      mockPrisma.contactForm.findMany.mockResolvedValue([unstarredContact]);
      mockPrisma.contactForm.count.mockResolvedValue(1);

      const result = await contactService.findAll({ isStarred: false });

      expect(mockPrisma.contactForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ starred: false }),
        }),
      );
      expect(result.data[0].starred).toBe(false);
    });

    it('should combine isStarred with isRead via AND', async () => {
      mockPrisma.contactForm.findMany.mockResolvedValue([]);
      mockPrisma.contactForm.count.mockResolvedValue(0);

      await contactService.findAll({ isStarred: true, isRead: false });

      expect(mockPrisma.contactForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            starred: true,
            readAt: null,
          }),
        }),
      );
    });

    it('should combine isStarred with isArchived via AND', async () => {
      mockPrisma.contactForm.findMany.mockResolvedValue([]);
      mockPrisma.contactForm.count.mockResolvedValue(0);

      await contactService.findAll({ isStarred: true, isArchived: false });

      expect(mockPrisma.contactForm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            starred: true,
            archived: false,
          }),
        }),
      );
    });

    it('should omit starred filter when isStarred is undefined', async () => {
      mockPrisma.contactForm.findMany.mockResolvedValue([baseContact]);
      mockPrisma.contactForm.count.mockResolvedValue(1);

      await contactService.findAll({});

      // The where should NOT contain starred key
      const callWhere = mockPrisma.contactForm.findMany.mock.calls[0][0].where;
      expect(callWhere).not.toHaveProperty('starred');
    });
  });

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
});
