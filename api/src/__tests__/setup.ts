// Test setup file
// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    product: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    tool: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    successCase: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    service: {
      findMany: jest.fn(),
    },
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});
