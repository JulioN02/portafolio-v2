import { describe, it, expect } from 'vitest';
import {
  blogPostSchema,
  blogPostUpdateSchema,
  blogPostFilterSchema,
} from '../blogPost.schema';
import { tagsSchema } from '../tags.schema';

const VALID_POST = {
  title: 'Simulador de circuitos',
  slug: 'simulador-circuitos',
  category: 'laboratorio',
  shortDescription: 'Aplicación web para simular circuitos eléctricos de forma interactiva.',
  coverImage: 'https://example.com/cover.jpg',
  body: '<p>Post sobre el desarrollo del simulador de circuitos eléctricos con React, Node.js y PostgreSQL, incluyendo la arquitectura, las decisiones técnicas y los resultados obtenidos en el proyecto.</p>',
  status: 'PUBLISHED',
};

describe('blogPostSchema tags', () => {
  it('accepts a post without tags (tags optional)', () => {
    const result = blogPostSchema.safeParse(VALID_POST);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toBeUndefined();
    }
  });

  it('accepts a post with valid tags', () => {
    const result = blogPostSchema.safeParse({ ...VALID_POST, tags: ['laboratorio', 'react'] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual(['laboratorio', 'react']);
    }
  });

  it('trims whitespace from tags', () => {
    const result = blogPostSchema.safeParse({ ...VALID_POST, tags: ['  laboratorio  ', 'react'] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual(['laboratorio', 'react']);
    }
  });

  it('rejects an empty tag string', () => {
    const result = blogPostSchema.safeParse({ ...VALID_POST, tags: [''] });
    expect(result.success).toBe(false);
  });

  it('rejects a tag longer than 30 characters', () => {
    const result = blogPostSchema.safeParse({ ...VALID_POST, tags: ['x'.repeat(31)] });
    expect(result.success).toBe(false);
  });

  it('rejects more than 10 tags', () => {
    const elevenTags = Array.from({ length: 11 }, (_, i) => `tag-${i}`);
    const result = blogPostSchema.safeParse({ ...VALID_POST, tags: elevenTags });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(JSON.stringify(result.error.issues)).toContain('Maximum 10 tags');
    }
  });

  it('accepts exactly 10 tags', () => {
    const tenTags = Array.from({ length: 10 }, (_, i) => `tag-${i}`);
    const result = blogPostSchema.safeParse({ ...VALID_POST, tags: tenTags });
    expect(result.success).toBe(true);
  });
});

describe('blogPostUpdateSchema tags', () => {
  it('still validates tags when provided', () => {
    const result = blogPostUpdateSchema.safeParse({ tags: Array.from({ length: 11 }, (_, i) => `t${i}`) });
    expect(result.success).toBe(false);
  });

  it('accepts a partial update with tags', () => {
    const result = blogPostUpdateSchema.safeParse({ tags: ['laboratorio'] });
    expect(result.success).toBe(true);
  });
});

describe('blogPostFilterSchema tag', () => {
  it('parses the optional tag filter alongside category/search', () => {
    const result = blogPostFilterSchema.safeParse({
      status: 'PUBLISHED',
      category: 'laboratorio',
      tag: 'react',
      search: 'simulador',
      page: '2',
      limit: '5',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        status: 'PUBLISHED',
        category: 'laboratorio',
        tag: 'react',
        search: 'simulador',
        page: 2,
        limit: 5,
      });
    }
  });

  it('treats tag as optional', () => {
    const result = blogPostFilterSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tag).toBeUndefined();
    }
  });
});

describe('tagsSchema export', () => {
  it('is exported from blogPost.schema for reuse', () => {
    expect(tagsSchema.safeParse(['a', 'b']).success).toBe(true);
  });
});