import { buildTemplate } from './networkingUtils';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const runTests = () => {
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

  assert(result.includes('Jamie'), 'Expected name replacement.');
  assert(result.includes('Acme'), 'Expected org replacement.');
};

runTests();
