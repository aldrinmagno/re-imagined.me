export type ImpactInventoryEntry = {
  id: string;
  title: string;
  company: string;
  dateRange: string;
  context: string;
  actions: string;
  outcomes: string;
  metrics: string;
  tools: string;
  collaborators: string;
  skillsUsed: string;
};

export type ImpactInventoryDraft = {
  entries: ImpactInventoryEntry[];
  includeInReport: boolean;
  updatedAt: string;
};

export type ImpactInventoryRecord = {
  id: string;
  user_id: string;
  entries: ImpactInventoryEntry[];
  include_in_report: boolean;
  updated_at: string;
};
