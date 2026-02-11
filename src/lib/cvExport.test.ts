import { describe, it, expect } from 'vitest';
import { buildCvPlainText } from './cvExport';

describe('buildCvPlainText', () => {
  const result = buildCvPlainText({
    headline: 'Product Lead',
    summary: 'Driving growth.',
    top_skills: ['Strategy', 'Analytics'],
    bullets: ['Delivered +20% activation']
  });

  it('includes headline', () => {
    expect(result).toContain('Product Lead');
  });

  it('includes skills section', () => {
    expect(result).toContain('Top Skills');
  });

  it('includes bullets section', () => {
    expect(result).toContain('Impact Highlights');
  });
});
