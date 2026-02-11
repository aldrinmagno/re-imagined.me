import { test } from 'vitest';
import { buildCvPlainText } from './cvExport';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const runTests = () => {
  const result = buildCvPlainText({
    headline: 'Product Lead',
    summary: 'Driving growth.',
    top_skills: ['Strategy', 'Analytics'],
    bullets: ['Delivered +20% activation']
  });

  assert(result.includes('Product Lead'), 'Expected headline in export.');
  assert(result.includes('Top Skills'), 'Expected skills section in export.');
  assert(result.includes('Impact Highlights'), 'Expected bullets section in export.');
};

test('buildCvPlainText', () => { runTests(); });
