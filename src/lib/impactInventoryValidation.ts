import type { ImpactInventoryEntry } from '../types/impactInventory';

export type ImpactInventoryEntryIssues = {
  title?: string;
  company?: string;
  dateRange?: string;
  outcomes?: string;
  metrics?: string;
};

export const validateImpactInventoryEntry = (entry: ImpactInventoryEntry): ImpactInventoryEntryIssues => {
  const issues: ImpactInventoryEntryIssues = {};

  if (!entry.title.trim()) {
    issues.title = 'Add a concise impact title.';
  }

  if (!entry.company.trim()) {
    issues.company = 'Add the company or organization.';
  }

  if (!entry.dateRange.trim()) {
    issues.dateRange = 'Add the date range so the impact has context.';
  }

  if (!entry.outcomes.trim()) {
    issues.outcomes = 'Summarize the outcomes you delivered.';
  }

  if (!entry.metrics.trim()) {
    issues.metrics = 'Share the metrics or proof points.';
  }

  return issues;
};
