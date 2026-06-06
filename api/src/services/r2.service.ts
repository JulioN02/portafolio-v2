const DEFAULT_BUCKET = 'general';

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

export const r2Service = {
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

    if (!response.ok) {
      throw new Error(`Failed to upload to Supabase Storage: ${response.statusText}`);
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

    if (!response.ok) {
      console.warn(`Failed to delete ${filename} from Supabase Storage:`, response.statusText);
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
};
