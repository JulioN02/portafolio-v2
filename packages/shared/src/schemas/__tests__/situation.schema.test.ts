import { describe, it, expect } from 'vitest';
import {
  situationCreateSchema,
  situationUpdateSchema,
  situationPatchSchema,
} from '../situation.schema';
import { featuredSchema } from '../featured.schema';

const VALID_CREATE = {
  title: 'No aparezco en Internet',
  description: 'Gana visibilidad y una presencia digital que explique tu propuesta.',
};

describe('situationCreateSchema', () => {
  it('accepts a minimal valid situation', () => {
    const result = situationCreateSchema.safeParse(VALID_CREATE);
    expect(result.success).toBe(true);
  });

  it('accepts optional active, order and serviceIds', () => {
    const result = situationCreateSchema.safeParse({
      ...VALID_CREATE,
      active: false,
      order: 7,
      serviceIds: ['svc-1', 'svc-2', 'svc-3'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.order).toBe(7);
      expect(result.data.active).toBe(false);
      expect(result.data.serviceIds).toEqual(['svc-1', 'svc-2', 'svc-3']);
    }
  });

  it('rejects a title longer than 120 characters', () => {
    const result = situationCreateSchema.safeParse({
      ...VALID_CREATE,
      title: 'x'.repeat(121),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('title');
    }
  });

  it('rejects an empty title', () => {
    const result = situationCreateSchema.safeParse({ ...VALID_CREATE, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a description longer than 500 characters', () => {
    const result = situationCreateSchema.safeParse({
      ...VALID_CREATE,
      description: 'd'.repeat(501),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('description');
    }
  });

  it('rejects an empty description', () => {
    const result = situationCreateSchema.safeParse({ ...VALID_CREATE, description: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an order above 10000', () => {
    const result = situationCreateSchema.safeParse({ ...VALID_CREATE, order: 10001 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('order');
    }
  });

  it('rejects a negative order', () => {
    const result = situationCreateSchema.safeParse({ ...VALID_CREATE, order: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects a non-integer order', () => {
    const result = situationCreateSchema.safeParse({ ...VALID_CREATE, order: 1.5 });
    expect(result.success).toBe(false);
  });

  it('rejects more than 3 serviceIds (max-3 hard rule, payload guard)', () => {
    const result = situationCreateSchema.safeParse({
      ...VALID_CREATE,
      serviceIds: ['a', 'b', 'c', 'd'],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('serviceIds');
    }
  });

  it('rejects duplicate serviceIds', () => {
    const result = situationCreateSchema.safeParse({
      ...VALID_CREATE,
      serviceIds: ['a', 'a', 'b'],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('serviceIds');
    }
  });

  it('rejects empty-string serviceIds', () => {
    const result = situationCreateSchema.safeParse({
      ...VALID_CREATE,
      serviceIds: [''],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-boolean active flag', () => {
    const result = situationCreateSchema.safeParse({ ...VALID_CREATE, active: 'yes' });
    expect(result.success).toBe(false);
  });
});

describe('situationUpdateSchema (PUT — full replacement)', () => {
  it('requires title and description', () => {
    const result = situationUpdateSchema.safeParse({ title: 'Solo título' });
    expect(result.success).toBe(false);
  });

  it('accepts the same shape as create', () => {
    const result = situationUpdateSchema.safeParse({
      ...VALID_CREATE,
      active: true,
      order: 3,
      serviceIds: ['svc-9'],
    });
    expect(result.success).toBe(true);
  });
});

describe('situationPatchSchema (PATCH — partial)', () => {
  it('accepts a partial update with only active', () => {
    const result = situationPatchSchema.safeParse({ active: false });
    expect(result.success).toBe(true);
  });

  it('accepts a partial update with only order', () => {
    const result = situationPatchSchema.safeParse({ order: 4 });
    expect(result.success).toBe(true);
  });

  it('accepts a partial update with only serviceIds', () => {
    const result = situationPatchSchema.safeParse({ serviceIds: ['svc-1'] });
    expect(result.success).toBe(true);
  });

  it('rejects an empty object (at least one field required)', () => {
    const result = situationPatchSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects more than 3 serviceIds on patch', () => {
    const result = situationPatchSchema.safeParse({ serviceIds: ['a', 'b', 'c', 'd'] });
    expect(result.success).toBe(false);
  });
});

describe('featuredSchema', () => {
  it('accepts featured true', () => {
    const result = featuredSchema.safeParse({ featured: true });
    expect(result.success).toBe(true);
  });

  it('accepts featured false', () => {
    const result = featuredSchema.safeParse({ featured: false });
    expect(result.success).toBe(true);
  });

  it('rejects a missing featured flag', () => {
    const result = featuredSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects a non-boolean featured value', () => {
    const result = featuredSchema.safeParse({ featured: 'true' });
    expect(result.success).toBe(false);
  });
});
