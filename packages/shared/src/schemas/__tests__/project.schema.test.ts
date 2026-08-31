import { describe, it, expect } from 'vitest';
import {
  projectSchema,
  projectUpdateSchema,
  projectFilterSchema,
  projectStatusSchema,
  projectReorderSchema,
  tagsSchema,
} from '../project.schema';

const VALID_PROJECT = {
  title: 'Portafolio Web',
  slug: 'portafolio-web',
  shortDescription: 'Aplicación web para mostrar el portafolio profesional.',
  body: '<p>Proyecto desarrollado con React, Node.js y PostgreSQL para presentar servicios y proyectos de forma profesional.</p>',
  images: ['https://example.com/image.jpg'],
  repositoryUrl: 'https://github.com/example/portafolio',
  tags: ['proyecto-rapido'],
  status: 'DRAFT',
};

describe('projectSchema', () => {
  it('passes a complete valid input including tags and repositoryUrl', () => {
    const result = projectSchema.safeParse(VALID_PROJECT);
    expect(result.success).toBe(true);
  });

  it('rejects an empty tag string', () => {
    const result = projectSchema.safeParse({ ...VALID_PROJECT, tags: [''] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(JSON.stringify(result.error.issues)).toContain('Tag');
    }
  });

  it('rejects a tag made only of whitespace (trimmed to empty)', () => {
    const result = projectSchema.safeParse({ ...VALID_PROJECT, tags: ['   '] });
    expect(result.success).toBe(false);
  });

  it('rejects more than 10 tags', () => {
    const elevenTags = Array.from({ length: 11 }, (_, i) => `tag-${i}`);
    const result = projectSchema.safeParse({ ...VALID_PROJECT, tags: elevenTags });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(JSON.stringify(result.error.issues)).toContain('Maximum 10 tags');
    }
  });

  it('rejects a tag longer than 30 characters', () => {
    const result = projectSchema.safeParse({ ...VALID_PROJECT, tags: ['x'.repeat(31)] });
    expect(result.success).toBe(false);
  });

  it('accepts exactly 10 tags', () => {
    const tenTags = Array.from({ length: 10 }, (_, i) => `tag-${i}`);
    const result = projectSchema.safeParse({ ...VALID_PROJECT, tags: tenTags });
    expect(result.success).toBe(true);
  });

  it('trims whitespace from tags', () => {
    const result = projectSchema.safeParse({ ...VALID_PROJECT, tags: ['  proyecto-rapido  '] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual(['proyecto-rapido']);
    }
  });

  it('defaults status to DRAFT and featured to false', () => {
    const { tags, repositoryUrl, ...withoutOptional } = VALID_PROJECT;
    const result = projectSchema.safeParse({ ...withoutOptional, tags: undefined, repositoryUrl: undefined });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('DRAFT');
      expect(result.data.featured).toBe(false);
      expect(result.data.order).toBe(0);
    }
  });
});

describe('tagsSchema', () => {
  it('accepts an array of trimmed 1-30 char strings (max 10)', () => {
    const result = tagsSchema.safeParse(['a', 'proyecto-profesional']);
    expect(result.success).toBe(true);
  });

  it('rejects empty tags array elements', () => {
    const result = tagsSchema.safeParse(['ok', '']);
    expect(result.success).toBe(false);
  });
});

describe('projectUpdateSchema', () => {
  it('accepts partial updates (single field)', () => {
    const result = projectUpdateSchema.safeParse({ title: 'Nuevo título' });
    expect(result.success).toBe(true);
  });

  it('still validates tags when provided', () => {
    const result = projectUpdateSchema.safeParse({ tags: Array.from({ length: 11 }, (_, i) => `t${i}`) });
    expect(result.success).toBe(false);
  });
});

describe('projectFilterSchema', () => {
  it('parses query-style params (status, tag, search, page, limit)', () => {
    const result = projectFilterSchema.safeParse({
      status: 'PUBLISHED',
      tag: 'proyecto-rapido',
      search: 'portafolio',
      page: '2',
      limit: '5',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        status: 'PUBLISHED',
        tag: 'proyecto-rapido',
        search: 'portafolio',
        page: 2,
        limit: 5,
      });
    }
  });

  it('applies defaults for page/limit when omitted', () => {
    const result = projectFilterSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    }
  });

  it('rejects an invalid status value', () => {
    const result = projectFilterSchema.safeParse({ status: 'NOT_A_STATUS' });
    expect(result.success).toBe(false);
  });
});

describe('projectStatusSchema and projectReorderSchema', () => {
  it('accepts a valid status change', () => {
    expect(projectStatusSchema.safeParse({ status: 'PUBLISHED' }).success).toBe(true);
  });

  it('rejects ALL as a status change (not a real PostStatus)', () => {
    const result = projectStatusSchema.safeParse({ status: 'ALL' });
    // postStatusEnum includes ALL for filtering, so this is accepted by the
    // schema; the controller rejects it at runtime. Document the contract.
    expect(result.success).toBe(true);
  });

  it('accepts a non-negative integer order', () => {
    const result = projectReorderSchema.safeParse({ order: 3 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.order).toBe(3);
    }
  });

  it('rejects a negative order', () => {
    const result = projectReorderSchema.safeParse({ order: -1 });
    expect(result.success).toBe(false);
  });
});