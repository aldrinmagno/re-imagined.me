import { describe, it, expect } from 'vitest';
import { validateImpactInventoryEntry } from './impactInventoryValidation';

const createEntry = (overrides: Partial<Parameters<typeof validateImpactInventoryEntry>[0]> = {}) => ({
  id: 'test-id',
  title: 'Impact headline',
  company: 'Company',
  dateRange: '2022 - 2023',
  context: 'Context',
  actions: 'Actions',
  outcomes: 'Outcomes',
  metrics: 'Metrics',
  tools: 'Tools',
  collaborators: 'Collaborators',
  skillsUsed: 'Skills',
  ...overrides
});

describe('validateImpactInventoryEntry', () => {
  it('returns no issues for a complete entry', () => {
    const issues = validateImpactInventoryEntry(createEntry());
    expect(Object.keys(issues)).toHaveLength(0);
  });

  it('flags blank title', () => {
    const issues = validateImpactInventoryEntry(createEntry({ title: ' ' }));
    expect(issues.title).toBeTruthy();
  });

  it('flags missing metrics', () => {
    const issues = validateImpactInventoryEntry(createEntry({ metrics: '' }));
    expect(issues.metrics).toBeTruthy();
  });
});
