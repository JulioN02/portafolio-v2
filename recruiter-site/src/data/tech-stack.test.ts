import { describe, it, expect } from 'vitest';
import { techStack } from './tech-stack';

// CV-aligned tech stack (RHP-6).
const REQUIRED = [
  'Nest.js',
  'JWT',
  'RBAC',
  'MySQL',
  'Prisma',
  'TDD',
  'SDD',
  'DDD',
  'Vercel',
  'Supabase',
  'CI/CD',
  'AI-assisted development',
] as const;

const REMOVED = ['Next.js', 'Vue.js', 'Tailwind', 'MongoDB', 'Figma', 'Linear'] as const;

const KEPT = [
  'React',
  'TypeScript',
  'Node.js',
  'Express',
  'PostgreSQL',
  'Docker',
  'Git/GitHub',
  'Linux',
  'Jest',
] as const;

const allItems = techStack.flatMap((group) => group.items.map((item) => item.name));

describe('tech-stack data (RHP-6)', () => {
  it('includes all 12 required CV items', () => {
    for (const name of REQUIRED) {
      expect(allItems, `missing: ${name}`).toContain(name);
    }
  });

  it('excludes all 6 removed tech items', () => {
    for (const name of REMOVED) {
      expect(allItems, `should not contain: ${name}`).not.toContain(name);
    }
  });

  it('keeps the CV-backed items', () => {
    for (const name of KEPT) {
      expect(allItems, `missing: ${name}`).toContain(name);
    }
  });

  it('groups items under Backend, Frontend, Metodologías, Plataformas-DevOps', () => {
    const categories = techStack.map((group) => group.category);
    expect(categories).toEqual(['Backend', 'Frontend', 'Metodologías', 'Plataformas-DevOps']);
  });

  it('has at least one item in every group', () => {
    for (const group of techStack) {
      expect(group.items.length, group.category).toBeGreaterThan(0);
    }
  });
});