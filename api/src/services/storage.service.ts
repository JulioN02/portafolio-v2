import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';

/**
 * Storage Service
 *
 * Abstraction over object storage. Uploads files to Supabase Storage when
 * configured (SUPABASE_PROJECT_ID + SUPABASE_SERVICE_KEY); otherwise falls
 * back to a local `/uploads` directory for local development.
 */
const DEFAULT_BUCKET = 'general';

// Local dev fallback directory (flat, mirrors upload.service.ts).
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

function getConfig(bucket?: string): { apiUrl: string; bucket: string; secretKey: string } | null {
  const projectId = process.env.SUPABASE_PROJECT_ID;
  const secretKey = process.env.SUPABASE_SERVICE_KEY;

  if (!projectId || !secretKey) return null;

  return {
    apiUrl: `https://${projectId}.supabase.co/storage/v1`,
    bucket: bucket || process.env.SUPABASE_BUCKET || DEFAULT_BUCKET,
    secretKey,
  };
}

export const storageService = {
  /**
   * Upload a file to Supabase Storage
   * @param bucket - Module bucket (servicios, productos, herramientas, blog, proyectos, casos-exito, general)
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    bucket?: string,
  ): Promise<{ url: string; filename: string }> {
    const config = getConfig(bucket);
    if (!config) {
      // No storage configured — return relative URL for local dev
      const prefix = bucket ? `/uploads/${bucket}` : '/uploads';
      return { url: `${prefix}/${filename}`, filename };
    }

    const response = await fetch(
      `${config.apiUrl}/object/${config.bucket}/${filename}`,
      {
        method: 'POST',
        headers: {
          'apikey': config.secretKey,
          'Content-Type': mimetype,
          'x-upsert': 'true',
        },
        body: buffer,
      },
    );

    const resp = response as { ok: boolean; statusText: string };
    if (!resp.ok) {
      throw new Error(`Failed to upload to Supabase Storage: ${resp.statusText}`);
    }

    const publicUrl = `${config.apiUrl}/object/public/${config.bucket}/${filename}`;
    return { url: publicUrl, filename };
  },

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(filename: string, bucket?: string): Promise<void> {
    const config = getConfig(bucket);
    if (!config) return;

    const response = await fetch(
      `${config.apiUrl}/object/${config.bucket}/${filename}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': config.secretKey,
        },
      },
    );

    const resp = response as { ok: boolean; statusText: string };
    if (!resp.ok) {
      console.warn(`Failed to delete ${filename} from Supabase Storage:`, resp.statusText);
    }
  },

  /**
   * Get the public URL for a file (no API call needed — URL is deterministic)
   */
  getPublicUrl(filename: string, bucket?: string): string | null {
    const config = getConfig(bucket);
    if (!config) return null;
    return `${config.apiUrl}/object/public/${config.bucket}/${filename}`;
  },

  /**
   * Check if remote storage is configured
   */
  isConfigured(): boolean {
    return getConfig() !== null;
  },

  /**
   * Download a file from Supabase Storage as a server-side stream.
   *
   * The simulators bucket is PRIVATE, so the object cannot be fetched from a
   * public URL — the service key authorizes this request server-side. The API
   * owns the security headers (CSP sandbox, nosniff, no-store) on the
   * response, which is why simulator content is never served directly from the
   * bucket origin.
   *
   * Local dev fallback: read from the flat /uploads directory.
   *
   * @returns a Node Readable stream + the stored content-type.
   */
  async downloadFile(
    bucket: string,
    fileName: string,
  ): Promise<{ stream: Readable; mimetype: string }> {
    const config = getConfig(bucket);
    if (!config) {
      const filepath = path.join(UPLOAD_DIR, fileName);
      return { stream: Readable.from([fs.readFileSync(filepath)]), mimetype: 'application/octet-stream' };
    }

    const response = await fetch(`${config.apiUrl}/object/${config.bucket}/${fileName}`, {
      headers: {
        'apikey': config.secretKey,
        'Authorization': `Bearer ${config.secretKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download ${fileName} from Supabase Storage: ${response.statusText}`);
    }
    if (!response.body) {
      throw new Error(`Empty response body downloading ${fileName} from Supabase Storage`);
    }

    const mimetype = response.headers.get('content-type') || 'application/octet-stream';
    return { stream: Readable.fromWeb(response.body as import('stream/web').ReadableStream), mimetype };
  },
};