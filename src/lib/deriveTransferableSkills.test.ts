import { describe, it, expect } from 'vitest';
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

describe('deriveTransferableSkills', () => {
  const result = deriveTransferableSkills([createEntry()]);

  it('derives at least one skill', () => {
    expect(result.transferable_skills.length).toBeGreaterThan(0);
  });

  it('produces one impact bullet per entry', () => {
    expect(result.impact_bullets).toHaveLength(1);
  });

  it('identifies stakeholder management skill', () => {
    expect(result.transferable_skills.some((s) => s.name === 'Stakeholder management')).toBe(true);
  });
});
