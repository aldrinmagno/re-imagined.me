import { test } from 'vitest';
import { deriveTransferableSkills } from './deriveTransferableSkills';

const createEntry = (overrides = {}) => ({
  id: 'entry-1',
  title: 'Launch analytics dashboard',
  company: 'Acme',
  dateRange: '2023',
  context: 'Needed visibility into funnel performance.',
  actions: 'Partnered with engineering to build dashboards and align stakeholders.',
  outcomes: 'Improved reporting cadence and decision speed.',
  metrics: 'Reduced reporting time by 40%.',
  tools: 'Looker, SQL',
  collaborators: 'Engineering, Marketing',
  skillsUsed: 'Analytics, stakeholder management',
  ...overrides
});

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const runTests = () => {
  const result = deriveTransferableSkills([createEntry()]);
  assert(result.transferable_skills.length > 0, 'Expected skills to be derived.');
  assert(result.impact_bullets.length === 1, 'Expected one impact bullet.');
  assert(
    result.transferable_skills.some((skill) => skill.name === 'Stakeholder management'),
    'Expected stakeholder management skill.'
  );
};

test('deriveTransferableSkills', () => { runTests(); });
