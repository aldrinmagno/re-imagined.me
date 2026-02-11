import { test } from 'vitest';
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

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const runTests = () => {
  const validEntryIssues = validateImpactInventoryEntry(createEntry());
  assert(Object.keys(validEntryIssues).length === 0, 'Expected no issues for a complete entry.');

  const missingTitleIssues = validateImpactInventoryEntry(createEntry({ title: ' ' }));
  assert(!!missingTitleIssues.title, 'Expected title issue when title is blank.');

  const missingMetricsIssues = validateImpactInventoryEntry(createEntry({ metrics: '' }));
  assert(!!missingMetricsIssues.metrics, 'Expected metrics issue when metrics are missing.');
};

test('validateImpactInventoryEntry', () => { runTests(); });
