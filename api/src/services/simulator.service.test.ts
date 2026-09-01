import { Readable } from 'stream';
import { simulatorService, SIMULATOR_MAX_SIZE } from '../services/simulator.service';
import { storageService } from '../services/storage.service';
import { PrismaClient } from '@prisma/client';

jest.mock('../services/storage.service', () => ({
  storageService: {
    isConfigured: jest.fn(),
    uploadFile: jest.fn(),
    downloadFile: jest.fn(),
  },
}));

const mockedStorage = storageService as jest.Mocked<typeof storageService>;
const mockPrisma = new PrismaClient();

const makeHtmlFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File =>
  ({
    fieldname: 'file',
    originalname: 'simulador.html',
    encoding: '7bit',
    mimetype: 'text/html',
    size: 2048,
    buffer: Buffer.from('<html><body><h1>Hola</h1><script>alert(1)</script></body></html>'),
    ...overrides,
  }) as Express.Multer.File;

const RECORD_BASE = {
  id: 'cm-sim-1',
  title: 'Mi Simulador',
  slug: 'mi-simulador',
  fileName: '1700000000000-simulador.html',
  size: 2048,
  mimeType: 'text/html',
  width: null,
  height: null,
  uploadedAt: new Date('2026-08-31T00:00:00.000Z'),
  createdAt: new Date('2026-08-31T00:00:00.000Z'),
  updatedAt: new Date('2026-08-31T00:00:00.000Z'),
  deletedAt: null,
};

describe('Simulator Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedStorage.isConfigured.mockReturnValue(true);
  });

  describe('upload', () => {
    it('validates, stores the file in the simulators bucket and creates a record with a slug from the title', async () => {
      mockedStorage.uploadFile.mockResolvedValue({
        url: 'https://cdn/simulators/1700000000000-simulador.html',
        filename: '1700000000000-simulador.html',
      });
      (mockPrisma.simulator.create as jest.Mock).mockResolvedValue(RECORD_BASE);

      const result = await simulatorService.upload({ title: '  Mi Simulador  ', file: makeHtmlFile() });

      expect(result).toEqual(RECORD_BASE);
      // File is stored in the private simulators bucket (never client-chosen).
      expect(mockedStorage.uploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.stringMatching(/^\d+-simulador\.html$/),
        'text/html',
        'simulators',
      );
      expect(mockPrisma.simulator.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Mi Simulador',
            slug: 'mi-simulador',
            size: 2048,
            mimeType: 'text/html',
            width: null,
            height: null,
          }),
        }),
      );
    });

    it('rejects files over 1MB with 400 (ValidationError) without touching storage', async () => {
      await expect(
        simulatorService.upload({ title: 'Grande', file: makeHtmlFile({ size: SIMULATOR_MAX_SIZE + 1 }) }),
      ).rejects.toMatchObject({ statusCode: 400, code: 'VALIDATION_ERROR' });
      expect(mockedStorage.uploadFile).not.toHaveBeenCalled();
      expect(mockPrisma.simulator.create).not.toHaveBeenCalled();
    });

    it('rejects non-HTML extensions (e.g. .js) with 400', async () => {
      await expect(
        simulatorService.upload({ title: 'Mal', file: makeHtmlFile({ originalname: 'evil.js' }) }),
      ).rejects.toMatchObject({ statusCode: 400, code: 'VALIDATION_ERROR' });
      expect(mockedStorage.uploadFile).not.toHaveBeenCalled();
    });

    it('rejects a non text/html mimetype', async () => {
      await expect(
        simulatorService.upload({
          title: 'Mal',
          file: makeHtmlFile({ mimetype: 'application/javascript', originalname: 'evil.html' }),
        }),
      ).rejects.toMatchObject({ statusCode: 400, code: 'VALIDATION_ERROR' });
      expect(mockedStorage.uploadFile).not.toHaveBeenCalled();
    });

    it('generates a unique slug by appending a counter when the base slug is taken', async () => {
      mockedStorage.uploadFile.mockResolvedValue({ url: 'https://cdn/x', filename: 'f.html' });
      (mockPrisma.simulator.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 'existing', slug: 'mi-simulador' })
        .mockResolvedValueOnce(null);
      (mockPrisma.simulator.create as jest.Mock).mockResolvedValue(RECORD_BASE);

      await simulatorService.upload({ title: 'Mi Simulador', file: makeHtmlFile() });

      const createCall = (mockPrisma.simulator.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.slug).toBe('mi-simulador-2');
    });

    it('persists width/height overrides when provided', async () => {
      mockedStorage.uploadFile.mockResolvedValue({ url: 'https://cdn/x', filename: 'f.html' });
      (mockPrisma.simulator.create as jest.Mock).mockResolvedValue(RECORD_BASE);

      await simulatorService.upload({ title: 'Mi Simulador', file: makeHtmlFile(), width: 900, height: 700 });

      const createCall = (mockPrisma.simulator.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.width).toBe(900);
      expect(createCall.data.height).toBe(700);
    });
  });

  describe('list', () => {
    it('returns non-deleted simulators ordered by upload date (newest first)', async () => {
      (mockPrisma.simulator.findMany as jest.Mock).mockResolvedValue([RECORD_BASE]);

      const result = await simulatorService.list();

      expect(result).toEqual([RECORD_BASE]);
      expect(mockPrisma.simulator.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { uploadedAt: 'desc' },
      });
    });
  });

  describe('getMetadata', () => {
    it('returns metadata for an existing id', async () => {
      (mockPrisma.simulator.findFirst as jest.Mock).mockResolvedValue(RECORD_BASE);

      const result = await simulatorService.getMetadata('cm-sim-1');

      expect(result).toEqual(RECORD_BASE);
      expect(mockPrisma.simulator.findFirst).toHaveBeenCalledWith({
        where: { id: 'cm-sim-1', deletedAt: null },
      });
    });

    it('returns null for an unknown id (controller maps to 404)', async () => {
      (mockPrisma.simulator.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await simulatorService.getMetadata('nope');

      expect(result).toBeNull();
    });
  });

  describe('download', () => {
    it('returns the record plus a stream for a simulator within the size limit', async () => {
      (mockPrisma.simulator.findFirst as jest.Mock).mockResolvedValue(RECORD_BASE);
      const html = '<html><body>demo</body></html>';
      mockedStorage.downloadFile.mockResolvedValue({
        stream: Readable.from([html]),
        mimetype: 'text/html',
      });

      const result = await simulatorService.download('cm-sim-1');

      expect(result?.record).toEqual(RECORD_BASE);
      expect(mockedStorage.downloadFile).toHaveBeenCalledWith('simulators', '1700000000000-simulador.html');
      // The returned stream actually carries the HTML content.
      const chunks: Buffer[] = [];
      for await (const chunk of result!.stream) {
        chunks.push(Buffer.from(chunk));
      }
      expect(Buffer.concat(chunks).toString('utf8')).toBe(html);
    });

    it('rejects stored content exceeding the 1MB serve-time guard with 400', async () => {
      (mockPrisma.simulator.findFirst as jest.Mock).mockResolvedValue({
        ...RECORD_BASE,
        size: SIMULATOR_MAX_SIZE + 1,
      });

      await expect(simulatorService.download('cm-sim-1')).rejects.toMatchObject({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
      });
      expect(mockedStorage.downloadFile).not.toHaveBeenCalled();
    });

    it('returns null for an unknown id', async () => {
      (mockPrisma.simulator.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await simulatorService.download('nope');

      expect(result).toBeNull();
    });

    it('only serves non-soft-deleted simulators (deletedAt null in the query)', async () => {
      (mockPrisma.simulator.findFirst as jest.Mock).mockResolvedValue(RECORD_BASE);
      mockedStorage.downloadFile.mockResolvedValue({ stream: Readable.from(['x']), mimetype: 'text/html' });

      await simulatorService.download('cm-sim-1');

      expect(mockPrisma.simulator.findFirst).toHaveBeenCalledWith({
        where: { id: 'cm-sim-1', deletedAt: null },
      });
    });
  });

  describe('softDelete', () => {
    it('soft deletes by setting deletedAt', async () => {
      (mockPrisma.simulator.update as jest.Mock).mockResolvedValue({ ...RECORD_BASE, deletedAt: new Date() });

      const result = await simulatorService.softDelete('cm-sim-1');

      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(mockPrisma.simulator.update).toHaveBeenCalledWith({
        where: { id: 'cm-sim-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});