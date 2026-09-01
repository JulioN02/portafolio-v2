import path from 'path';
import { PrismaClient } from '@prisma/client';
import { storageService } from './storage.service.js';
import { uploadService } from './upload.service.js';
import { ValidationError } from '../utils/errors.js';

const prisma = new PrismaClient();

/** Simulator files are capped at 1MB at upload time AND at serve time. */
export const SIMULATOR_MAX_SIZE = 1 * 1024 * 1024;

/** Simulators are stored in the private bucket only (never client-chosen). */
export const SIMULATOR_BUCKET = 'simulators';

export interface SimulatorUploadInput {
  title: string;
  file: Express.Multer.File;
  width?: number;
  height?: number;
}

/**
 * Pure validation for a simulator upload:
 * `.html` extension + `text/html` mimetype + size ≤ 1MB.
 */
export function validateSimulatorFile(file: Express.Multer.File): { valid: boolean; error?: string } {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.html') {
    return {
      valid: false,
      error: `Invalid file extension: ${ext || '(none)'}. Simulators must be .html files (text/html only)`,
    };
  }

  if (file.mimetype !== 'text/html') {
    return {
      valid: false,
      error: `Invalid file type: ${file.mimetype}. Simulators must be text/html`,
    };
  }

  if (file.size > SIMULATOR_MAX_SIZE) {
    return {
      valid: false,
      error: `File too large: ${file.size} bytes. Max: ${SIMULATOR_MAX_SIZE} bytes (1MB)`,
    };
  }

  return { valid: true };
}

/** Slugify a title for stable embed references: lowercase, non-alphanumeric → '-'. */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const simulatorService = {
  /**
   * Validate, store (private `simulators` bucket) and record a simulator.
   * The bucket is forced server-side; the slug is generated from the title
   * and made unique against existing records.
   */
  async upload({ title, file, width, height }: SimulatorUploadInput) {
    const cleanTitle = (title || '').trim();
    if (!cleanTitle) {
      throw new ValidationError('Title is required');
    }

    const validation = validateSimulatorFile(file);
    if (!validation.valid) {
      throw new ValidationError(validation.error || 'Invalid simulator file');
    }

    const slug = await this.resolveUniqueSlug(cleanTitle);

    // uploadService.saveFile validates the bucket against the allowlist and
    // handles remote (Supabase) + local-dev disk writes.
    const { filename } = await uploadService.saveFile(file, SIMULATOR_BUCKET);

    return prisma.simulator.create({
      data: {
        title: cleanTitle,
        slug,
        fileName: filename,
        size: file.size,
        mimeType: file.mimetype,
        width: width ?? null,
        height: height ?? null,
      },
    });
  },

  /** All non-deleted simulators, newest upload first (admin list / picker). */
  async list() {
    return prisma.simulator.findMany({
      where: { deletedAt: null },
      orderBy: { uploadedAt: 'desc' },
    });
  },

  /** Metadata for a single non-deleted simulator (admin editor prefill). */
  async getMetadata(id: string) {
    return prisma.simulator.findFirst({
      where: { id, deletedAt: null },
    });
  },

  /**
   * Serving path: fetch the record (non-deleted), re-check the 1MB size guard
   * at serve time, then stream the object from the private bucket.
   * Returns null when the simulator is unknown/soft-deleted (controller → 404).
   */
  async download(id: string) {
    const record = await prisma.simulator.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) return null;

    if (record.size > SIMULATOR_MAX_SIZE) {
      throw new ValidationError('Simulator content exceeds the 1MB size limit');
    }

    const { stream, mimetype } = await storageService.downloadFile(SIMULATOR_BUCKET, record.fileName);
    return { record, stream, mimetype };
  },

  /** Soft-delete: content stops being served and disappears from the picker. */
  async softDelete(id: string) {
    return prisma.simulator.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  /** Append -2, -3, … until the slug is unique among stored simulators. */
  async resolveUniqueSlug(title: string): Promise<string> {
    const base = slugifyTitle(title) || 'simulador';
    let candidate = base;
    let counter = 2;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await prisma.simulator.findUnique({ where: { slug: candidate } });
      if (!existing) return candidate;
      candidate = `${base}-${counter}`;
      counter += 1;
    }
  },
};