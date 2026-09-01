import { categoryToTags } from '../scripts/category-to-tags';

describe('migrate-category-to-tags (pure mapping)', () => {
  it('maps a non-empty category to a single first tag', () => {
    expect(categoryToTags('laboratorio')).toEqual(['laboratorio']);
  });

  it('trims surrounding whitespace from the category', () => {
    expect(categoryToTags('  laboratorio  ')).toEqual(['laboratorio']);
  });

  it('maps an empty category to no tags', () => {
    expect(categoryToTags('')).toEqual([]);
  });

  it('maps a whitespace-only category to no tags', () => {
    expect(categoryToTags('   ')).toEqual([]);
  });

  it('clamps an over-long category to 30 characters (tagsSchema bound)', () => {
    expect(categoryToTags('x'.repeat(40))).toEqual(['x'.repeat(30)]);
  });
});