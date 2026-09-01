/**
 * Data migration: BlogPost.category → BlogPost.tags
 *
 * Maps each existing free-text `category` value to the first tag using the
 * pure `categoryToTags` helper (non-empty category → single tag, empty → []).
 * `category` column is KEPT (API/recruiter compat) and derived from the first
 * tag on future writes (see blog-post.service.ts).
 *
 * IDEMPOTENT: a post is only updated when its current `tags` differ from the
 * target value, so re-running is a no-op.
 *
 * Usage:
 *   pnpm --filter api exec tsx src/scripts/migrate-category-to-tags.ts
 */
import { PrismaClient } from '@prisma/client';
import { pathToFileURL } from 'url';
import { categoryToTags } from './category-to-tags.js';

const prisma = new PrismaClient();

async function migrate() {
  const posts = await prisma.blogPost.findMany({
    select: { id: true, category: true, tags: true },
  });

  let updated = 0;
  let unchanged = 0;

  for (const post of posts) {
    const target = categoryToTags(post.category);
    const current = post.tags ?? [];
    const same =
      current.length === target.length &&
      current.every((tag, i) => tag === target[i]);

    if (same) {
      unchanged += 1;
      continue;
    }

    await prisma.blogPost.update({
      where: { id: post.id },
      data: { tags: target },
    });
    updated += 1;
  }

  console.log(
    `[migrate-category-to-tags] ${posts.length} posts scanned → ${updated} updated, ${unchanged} unchanged.`,
  );
}

/** Run only when executed directly (tsx src/scripts/...), not when imported. */
const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  migrate()
    .catch((error) => {
      console.error('[migrate-category-to-tags] FAILED:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}