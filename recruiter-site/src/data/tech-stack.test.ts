import { describe, it, expect } from 'vitest';
import { DATA } from './tech-stack';

const DOMAIN_IDS = ['backend', 'data', 'infrastructure', 'frontend'] as const;

const DOMAIN_TITLE_KEYS = [
  'techStack.domain.backend',
  'techStack.domain.data',
  'techStack.domain.infrastructure',
  'techStack.domain.frontend',
] as const;

const ITEM_IDS = [
  'nodejs',
  'typescript',
  'express',
  'nestjs',
  'postgresql',
  'mysql',
  'prisma',
  'docker',
  'linux',
  'cicd',
  'git',
  'react',
  'vite',
  'vanilla',
  'htmlcss',
] as const;

const allItems = DATA.flatMap((domain) => domain.items);

describe('tech-stack data (domain-grid redesign)', () => {
  it('groups 15 technologies under 4 system-layer domains', () => {
    expect(DATA.map((domain) => domain.id)).toEqual([...DOMAIN_IDS]);
    expect(allItems).toHaveLength(15);
  });

  it('uses the i18n title keys for every domain', () => {
    expect(DATA.map((domain) => domain.titleKey)).toEqual([...DOMAIN_TITLE_KEYS]);
  });

  it('exposes every tech by id with a label key and an icon component', () => {
    expect(allItems.map((item) => item.id)).toEqual([...ITEM_IDS]);
    for (const item of allItems) {
      expect(item.labelKey, item.id).toBe(`techStack.item.${item.id}`);
      expect(item.Icon, item.id).toBeTypeOf('function');
    }
  });

  it('has at least one item in every domain', () => {
    for (const domain of DATA) {
      expect(domain.items.length, domain.id).toBeGreaterThan(0);
    }
  });

  it('drops the old subjective-percentage items from the redesign', () => {
    const dropped = [
      'jwt',
      'rbac',
      'tdd',
      'sdd',
      'ddd',
      'ai',
      'vercel',
      'supabase',
      'jest',
    ] as const;
    for (const id of dropped) {
      expect(allItems.map((item) => item.id), `should not contain: ${id}`).not.toContain(id);
    }
  });
});
