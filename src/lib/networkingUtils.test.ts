import { describe, it, expect } from 'vitest';
import { buildTemplate } from './networkingUtils';

describe('buildTemplate', () => {
  const result = buildTemplate('Hi {name} at {org}', {
    id: '1',
    user_id: 'user',
    name: 'Jamie',
    org: 'Acme',
    role: 'Recruiter',
    channel: null,
    last_contacted: null,
    next_follow_up: null,
    notes: null,
    updated_at: '2025-01-01'
  });

  it('replaces {name} placeholder', () => {
    expect(result).toContain('Jamie');
  });

  it('replaces {org} placeholder', () => {
    expect(result).toContain('Acme');
  });
});
