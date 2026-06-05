interface StorageConfig {
  apiUrl: string;      // Supabase Storage API URL
  bucket: string;      // Bucket name
  publicUrl: string;   // Public base URL for the bucket
  secretKey: string;   // service_role key for admin ops
}

function getConfig(): StorageConfig | null {
  const projectId = process.env.SUPABASE_PROJECT_ID;
  const secretKey = process.env.SUPABASE_SERVICE_KEY;
  const bucket = process.env.SUPABASE_BUCKET || 'portafolio-v2-images';

  if (!projectId || !secretKey) return null;

  return {
    apiUrl: `https://${projectId}.supabase.co/storage/v1`,
    bucket,
    publicUrl: `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}`,
    secretKey,
  };
}

export const r2Service = {
  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<{ url: string; filename: string }> {
    const config = getConfig();
    if (!config) {
      // No storage configured — return relative URL for local dev
      return { url: `/uploads/${filename}`, filename };
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

    return { url: `${config.publicUrl}/${filename}`, filename };
  },

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(filename: string): Promise<void> {
    const config = getConfig();
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
  getPublicUrl(filename: string): string | null {
    const config = getConfig();
    if (!config) return null;
    return `${config.publicUrl}/${filename}`;
  },

  /**
   * Check if remote storage is configured
   */
  isConfigured(): boolean {
    return getConfig() !== null;
  },
};
