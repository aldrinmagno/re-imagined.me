import { describe, it, expect } from 'vitest';
import { filterRadarItems } from './radarUtils';
import type { RadarItemRecord } from '../types/radar';

describe('filterRadarItems', () => {
  const items: RadarItemRecord[] = [
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

  it('filters by type and query', () => {
    const result = filterRadarItems(items, { query: 'acme', status: 'all', priority: 'all', type: 'company' });
    expect(result).toHaveLength(1);
  });
});
