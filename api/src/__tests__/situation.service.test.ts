import { situationService, MAX_SERVICES_PER_SITUATION } from '../services/situation.service';
import { PrismaClient } from '@prisma/client';
import { ConflictError, NotFoundError } from '../utils/errors';

const mockPrisma = new PrismaClient() as unknown as {
  situation: Record<string, jest.Mock>;
  service: Record<string, jest.Mock>;
  $transaction: jest.Mock;
};

type TxMock = {
  situation: Record<string, jest.Mock>;
  service: Record<string, jest.Mock>;
};

function makeTx(): TxMock {
  return {
    situation: { create: jest.fn(), update: jest.fn() },
    service: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  };
}

describe('Situation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findPublic', () => {
    it('returns only active situations with published services, capped at 3', async () => {
      const raw = [
        {
          id: 'sit-1',
          title: 'No aparezco en Internet',
          description: 'desc',
          order: 0,
          services: [
            {
              id: 'svc-1',
              title: 'Web',
              slug: 'web',
              classification: 'Desarrollo web',
              shortDescription: 's',
              fullDescription: 'f',
              includedItems: [],
              images: [],
              technicalImages: [],
              externalLink: null,
            },
          ],
        },
      ];
      mockPrisma.situation.findMany.mockResolvedValue(raw);

      const result = await situationService.findPublic();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].services).toHaveLength(1);
      expect(result.data[0].services[0]).not.toHaveProperty('status');

      const call = mockPrisma.situation.findMany.mock.calls[0][0];
      expect(call.where).toMatchObject({ active: true });
      expect(call.where.services.some).toMatchObject({ status: 'PUBLISHED', deletedAt: null });
      expect(call.select.services.take).toBe(MAX_SERVICES_PER_SITUATION);
    });
  });

  describe('applyServiceLinks', () => {
    it('replaces the linked set and succeeds when within the max', async () => {
      const tx = makeTx();
      tx.service.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);
      tx.service.count.mockResolvedValue(2);

      await situationService.applyServiceLinks(tx as never, 'sit-1', ['a', 'b']);

      expect(tx.service.updateMany).toHaveBeenCalledWith({
        where: { situationId: 'sit-1' },
        data: { situationId: null },
      });
      expect(tx.service.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['a', 'b'] } },
        data: { situationId: 'sit-1' },
      });
    });

    it('throws NotFoundError when a requested service does not exist', async () => {
      const tx = makeTx();
      tx.service.findMany.mockResolvedValue([{ id: 'a' }]);

      await expect(
        situationService.applyServiceLinks(tx as never, 'sit-1', ['a', 'missing']),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('throws 409 SITUATION_SERVICE_LIMIT when the transaction exceeds the max', async () => {
      const tx = makeTx();
      tx.service.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
      tx.service.count.mockResolvedValue(4); // race: a concurrent insert pushed it over

      await expect(
        situationService.applyServiceLinks(tx as never, 'sit-1', ['a', 'b', 'c']),
      ).rejects.toMatchObject({ statusCode: 409, code: 'SITUATION_SERVICE_LIMIT' });

      expect(ConflictError).toBeDefined();
    });

    it('does nothing when serviceIds is undefined', async () => {
      const tx = makeTx();
      await situationService.applyServiceLinks(tx as never, 'sit-1', undefined);
      expect(tx.service.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('creates the situation and applies service links inside the transaction', async () => {
      const tx = makeTx();
      tx.situation.create.mockResolvedValue({ id: 'sit-new', title: 'T', order: 0 });
      tx.service.findMany.mockResolvedValue([{ id: 'a' }]);
      tx.service.count.mockResolvedValue(1);
      mockPrisma.$transaction.mockImplementation(async (cb: (t: TxMock) => unknown) => cb(tx));

      await situationService.create({
        title: 'T',
        description: 'D',
        order: 0,
        serviceIds: ['a'],
      });

      expect(tx.situation.create).toHaveBeenCalled();
      expect(tx.service.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['a'] } },
        data: { situationId: 'sit-new' },
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes an existing situation (services keep working via SetNull)', async () => {
      mockPrisma.situation.findUnique.mockResolvedValue({ id: 'sit-1', services: [] });
      mockPrisma.situation.delete.mockResolvedValue({ id: 'sit-1' });

      await situationService.remove('sit-1');

      expect(mockPrisma.situation.delete).toHaveBeenCalledWith({
        where: { id: 'sit-1' },
        select: expect.anything(),
      });
    });

    it('throws NotFoundError when the situation does not exist', async () => {
      mockPrisma.situation.findUnique.mockResolvedValue(null);
      await expect(situationService.remove('missing')).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
