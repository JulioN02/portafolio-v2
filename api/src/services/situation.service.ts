import { Prisma, PrismaClient } from '@prisma/client';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { PUBLIC_SERVICE_SELECT, selectPublicService } from './public.selectors.js';

const prisma = new PrismaClient();

export const MAX_SERVICES_PER_SITUATION = 3;

const SITUATION_SELECT = {
  id: true,
  title: true,
  description: true,
  active: true,
  order: true,
  createdAt: true,
  updatedAt: true,
} as const;

type SituationData = {
  title: string;
  description: string;
  active?: boolean;
  order?: number;
  serviceIds?: string[];
};

export const situationService = {
  /** Public: active situations with ≥1 PUBLISHED, non-deleted service. */
  async findPublic() {
    const situations = await prisma.situation.findMany({
      where: {
        active: true,
        services: { some: { status: 'PUBLISHED', deletedAt: null } },
      },
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
        services: {
          where: { status: 'PUBLISHED', deletedAt: null },
          select: PUBLIC_SERVICE_SELECT,
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
          take: MAX_SERVICES_PER_SITUATION,
        },
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });

    return {
      data: situations.map((situation) => ({
        id: situation.id,
        title: situation.title,
        description: situation.description,
        order: situation.order,
        services: situation.services.map(selectPublicService),
      })),
    };
  },

  async findAll() {
    const situations = await prisma.situation.findMany({
      select: {
        ...SITUATION_SELECT,
        services: {
          select: { id: true, title: true, classification: true, status: true, deletedAt: true },
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        },
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });
    return situations.map((situation) => ({
      ...situation,
      services: situation.services.filter((service) => service.deletedAt === null),
    }));
  },

  async findById(id: string) {
    const situation = await prisma.situation.findUnique({
      where: { id },
      select: {
        ...SITUATION_SELECT,
        services: {
          where: { deletedAt: null },
          select: { id: true, title: true, classification: true, status: true },
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
    if (!situation) {
      throw new NotFoundError('Situation not found');
    }
    return situation;
  },

  /**
   * Applies the situation's service set inside a transaction.
   * `serviceIds` REPLACES the linked services (omitted = keep current links).
   * Hard max-3 rule: payload >3 is rejected by Zod (400); a concurrent
   * transaction that would still push the set over 3 loses with 409
   * SITUATION_SERVICE_LIMIT (serializable isolation re-check).
   */
  async applyServiceLinks(
    tx: Prisma.TransactionClient,
    situationId: string,
    serviceIds: string[] | undefined,
  ) {
    if (serviceIds === undefined) return;

    // Validate the services exist (and are not soft-deleted).
    const services = await tx.service.findMany({
      where: { id: { in: serviceIds }, deletedAt: null },
      select: { id: true },
    });
    if (services.length !== new Set(serviceIds).size) {
      throw new NotFoundError('One or more services not found');
    }

    // Replace: unlink every currently linked service, then link the payload set.
    await tx.service.updateMany({ where: { situationId }, data: { situationId: null } });
    if (serviceIds.length > 0) {
      await tx.service.updateMany({
        where: { id: { in: serviceIds } },
        data: { situationId },
      });
    }

    const linked = await tx.service.count({ where: { situationId } });
    if (linked > MAX_SERVICES_PER_SITUATION) {
      throw new ConflictError(
        `Una situación no puede tener más de ${MAX_SERVICES_PER_SITUATION} servicios`,
        'SITUATION_SERVICE_LIMIT',
      );
    }
  },

  async create(data: SituationData) {
    return prisma.$transaction(
      async (tx) => {
        const situation = await tx.situation.create({
          data: {
            title: data.title,
            description: data.description,
            active: data.active ?? true,
            order: data.order ?? 0,
          },
          select: SITUATION_SELECT,
        });
        await this.applyServiceLinks(tx, situation.id, data.serviceIds);
        return situation;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  },

  async update(id: string, data: SituationData) {
    await this.findById(id);
    return prisma.$transaction(
      async (tx) => {
        const updateData: Prisma.SituationUpdateInput = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.active !== undefined) updateData.active = data.active;
        if (data.order !== undefined) updateData.order = data.order;
        const situation = await tx.situation.update({
          where: { id },
          data: updateData,
          select: SITUATION_SELECT,
        });
        await this.applyServiceLinks(tx, id, data.serviceIds);
        return situation;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  },

  async patch(id: string, data: { active?: boolean; order?: number }) {
    await this.findById(id);
    return prisma.situation.update({
      where: { id },
      data: {
        ...(data.active !== undefined && { active: data.active }),
        ...(data.order !== undefined && { order: data.order }),
      },
      select: SITUATION_SELECT,
    });
  },

  async remove(id: string) {
    await this.findById(id);
    // FK onDelete: SetNull — linked services keep working without a situation.
    return prisma.situation.delete({ where: { id }, select: SITUATION_SELECT });
  },
};
