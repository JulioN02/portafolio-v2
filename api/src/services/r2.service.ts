import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  NoSuchKey,
} from '@aws-sdk/client-s3';

interface R2Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
}

function getConfig(): R2Config | null {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  return { endpoint, accessKeyId, secretAccessKey, bucket, publicUrl: publicUrl || '' };
}

function createClient(config: R2Config): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    requestHandler: {
      requestTimeout: 10_000,
    },
  });
}

export const r2Service = {
  /**
   * Upload a file buffer to R2
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<{ url: string; filename: string }> {
    const config = getConfig();
    if (!config) {
      // Fallback: no R2 configured, return relative URL for local dev
      return { url: `/uploads/${filename}`, filename };
    }

    const client = createClient(config);

    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: filename,
      Body: buffer,
      ContentType: mimetype,
    });

    await client.send(command);

    const url = config.publicUrl
      ? `${config.publicUrl}/${filename}`
      : `/uploads/${filename}`;

    return { url, filename };
  },

  /**
   * Delete a file from R2
   */
  async deleteFile(filename: string): Promise<void> {
    const config = getConfig();
    if (!config) return;

    const client = createClient(config);

    const command = new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: filename,
    });

    await client.send(command);
  },

  /**
   * Get a readable stream of a file from R2 (for proxying)
   */
  async getFile(filename: string): Promise<{ body: ReadableStream | undefined; contentType: string } | null> {
    const config = getConfig();
    if (!config) return null;

    const client = createClient(config);

    try {
      const command = new GetObjectCommand({
        Bucket: config.bucket,
        Key: filename,
      });

      const response = await client.send(command);
      return {
        body: response.Body as ReadableStream | undefined,
        contentType: response.ContentType || 'application/octet-stream',
      };
    } catch (error) {
      if (error instanceof NoSuchKey || (error as { name?: string })?.name === 'NoSuchKey') {
        return null;
      }
      throw error;
    }
  },

  /**
   * Check if R2 is configured
   */
  isConfigured(): boolean {
    return getConfig() !== null;
  },
};
