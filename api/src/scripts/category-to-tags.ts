/**
 * Pure mapping used by the category→tags data migration (and its tests).
 *
 * Maps an existing BlogPost `category` value to the first tag:
 *   - non-empty category → [ trimmed category clamped to 30 chars ]
 *   - empty/whitespace   → []
 *
 * `category` column is KEPT for API/recruiter compat; see blog-post.service.ts
 * for the write-time derivation of category from the first tag.
 */
export function categoryToTags(category: string): string[] {
  const trimmed = category.trim();
  if (!trimmed) return [];
  return [trimmed.slice(0, 30)];
}