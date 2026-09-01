import fs from 'fs';
import path from 'path';
import { storageService } from '../services/storage.service';

const ORIGINAL_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
const ORIGINAL_SECRET_KEY = process.env.SUPABASE_SERVICE_KEY;
const ORIGINAL_BUCKET = process.env.SUPABASE_BUCKET;

const buffer = Buffer.from('data');

describe('storageService', () => {
  beforeEach(() => {
    delete process.env.SUPABASE_PROJECT_ID;
    delete process.env.SUPABASE_SERVICE_KEY;
    delete process.env.SUPABASE_BUCKET;
    jest.restoreAllMocks();
  });

  afterAll(() => {
    if (ORIGINAL_PROJECT_ID) process.env.SUPABASE_PROJECT_ID = ORIGINAL_PROJECT_ID;
    if (ORIGINAL_SECRET_KEY) process.env.SUPABASE_SERVICE_KEY = ORIGINAL_SECRET_KEY;
    if (ORIGINAL_BUCKET) process.env.SUPABASE_BUCKET = ORIGINAL_BUCKET;
  });

  describe('when storage is not configured', () => {
    it('isConfigured returns false', () => {
      expect(storageService.isConfigured()).toBe(false);
    });

    it('uploadFile returns a relative URL (local dev)', async () => {
      const result = await storageService.uploadFile(buffer, 'photo.png', 'image/png');
      expect(result.url).toBe('/uploads/photo.png');
      expect(result.filename).toBe('photo.png');
    });

    it('uploadFile respects bucket prefix', async () => {
      const result = await storageService.uploadFile(buffer, 'photo.png', 'image/png', 'blog');
      expect(result.url).toBe('/uploads/blog/photo.png');
    });

    it('deleteFile is a no-op', async () => {
      await expect(storageService.deleteFile('photo.png')).resolves.toBeUndefined();
    });

    it('getPublicUrl returns null', () => {
      expect(storageService.getPublicUrl('photo.png')).toBeNull();
    });
  });

  describe('when storage is configured', () => {
    beforeEach(() => {
      process.env.SUPABASE_PROJECT_ID = 'proj-123';
      process.env.SUPABASE_SERVICE_KEY = 'secret';
    });

    it('isConfigured returns true', () => {
      expect(storageService.isConfigured()).toBe(true);
    });

    it('uploadFile POSTs to Supabase and returns public URL', async () => {
      const fetchMock = jest.fn().mockResolvedValue({ ok: true, statusText: 'OK' });
      global.fetch = fetchMock as unknown as typeof fetch;

      const result = await storageService.uploadFile(buffer, 'photo.png', 'image/png');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://proj-123.supabase.co/storage/v1/object/general/photo.png',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            apikey: 'secret',
            // Correct Content-Type is stored with the object so it is served
            // with the right type (never HTML/SVG-as-HTML).
            'Content-Type': 'image/png',
          }),
        }),
      );
      expect(result.url).toBe('https://proj-123.supabase.co/storage/v1/object/public/general/photo.png');
    });

    it('uploadFile uses SUPABASE_BUCKET when set', async () => {
      process.env.SUPABASE_BUCKET = 'casos-exito';
      const fetchMock = jest.fn().mockResolvedValue({ ok: true, statusText: 'OK' });
      global.fetch = fetchMock as unknown as typeof fetch;

      await storageService.uploadFile(buffer, 'photo.png', 'image/png');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://proj-123.supabase.co/storage/v1/object/casos-exito/photo.png',
        expect.anything(),
      );
    });

    it('uploadFile throws when the upload fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, statusText: 'Unauthorized' }) as unknown as typeof fetch;

      await expect(storageService.uploadFile(buffer, 'photo.png', 'image/png')).rejects.toThrow(
        'Failed to upload to Supabase Storage: Unauthorized',
      );
    });

    it('deleteFile DELETEs from Supabase', async () => {
      const fetchMock = jest.fn().mockResolvedValue({ ok: true, statusText: 'OK' });
      global.fetch = fetchMock as unknown as typeof fetch;

      await storageService.deleteFile('photo.png');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://proj-123.supabase.co/storage/v1/object/general/photo.png',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });

    it('deleteFile warns but does not throw on failure', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      global.fetch = jest.fn().mockResolvedValue({ ok: false, statusText: 'NotFound' }) as unknown as typeof fetch;

      await expect(storageService.deleteFile('photo.png')).resolves.toBeUndefined();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('getPublicUrl returns deterministic URL', () => {
      expect(storageService.getPublicUrl('photo.png')).toBe(
        'https://proj-123.supabase.co/storage/v1/object/public/general/photo.png',
      );
    });
  });

  describe('downloadFile', () => {
    it('reads from the local uploads dir when storage is not configured', async () => {
      const html = '<html><body>local demo</body></html>';
      const filepath = path.join(process.cwd(), 'uploads', 'local-sim.html');
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
      fs.writeFileSync(filepath, html);

      try {
        const { stream, mimetype } = await storageService.downloadFile('simulators', 'local-sim.html');
        const chunks: Buffer[] = [];
        for await (const chunk of stream) chunks.push(Buffer.from(chunk));
        expect(Buffer.concat(chunks).toString('utf8')).toBe(html);
        expect(mimetype).toBe('application/octet-stream');
      } finally {
        fs.unlinkSync(filepath);
      }
    });

    it('fetches the private object with the service key and streams its content', async () => {
      process.env.SUPABASE_PROJECT_ID = 'proj-123';
      process.env.SUPABASE_SERVICE_KEY = 'secret';
      const html = '<html><body>demo</body></html>';
      const fetchMock = jest.fn().mockResolvedValue(
        new Response(html, { headers: { 'content-type': 'text/html' } }),
      );
      global.fetch = fetchMock as unknown as typeof fetch;

      const { stream, mimetype } = await storageService.downloadFile('simulators', 'sim.html');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://proj-123.supabase.co/storage/v1/object/simulators/sim.html',
        expect.objectContaining({
          headers: expect.objectContaining({
            apikey: 'secret',
            // Private bucket → server-side authorization with the service key.
            Authorization: 'Bearer secret',
          }),
        }),
      );
      const chunks: Buffer[] = [];
      for await (const chunk of stream) chunks.push(Buffer.from(chunk));
      expect(Buffer.concat(chunks).toString('utf8')).toBe(html);
      expect(mimetype).toBe('text/html');
    });

    it('throws when the object download fails', async () => {
      process.env.SUPABASE_PROJECT_ID = 'proj-123';
      process.env.SUPABASE_SERVICE_KEY = 'secret';
      global.fetch = jest.fn().mockResolvedValue(
        new Response(null, { status: 404, statusText: 'Not Found' }),
      ) as unknown as typeof fetch;

      await expect(storageService.downloadFile('simulators', 'missing.html')).rejects.toThrow(
        'Failed to download missing.html from Supabase Storage: Not Found',
      );
    });
  });
});