import { test } from 'vitest';
import { filterRadarItems } from './radarUtils';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const runTests = () => {
  const items = [
    {
      id: '1',
      user_id: 'user',
      type: 'company',
      name: 'Acme',
      link: 'https://acme.com',
      priority: 1,
      status: 'watching',
      meta: { fit_notes: 'Great culture', tags: ['remote'] },
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      user_id: 'user',
      type: 'recruiter',
      name: 'Jamie',
      link: null,
      priority: 2,
      status: 'applied',
      meta: { fit_notes: 'Reached out via LinkedIn', tags: ['follow-up'] },
      updated_at: new Date().toISOString()
    }
  ];

  const result = filterRadarItems(items, { query: 'acme', status: 'all', priority: 'all', type: 'company' });
  assert(result.length === 1, 'Expected to match company by query.');
};

test('filterRadarItems', () => { runTests(); });
