export type JobSearchEventType =
  | 'apply'
  | 'followup'
  | 'interview'
  | 'reject'
  | 'offer'
  | 'outreach';

export type JobSearchEventRecord = {
  id: string;
  user_id: string;
  type: JobSearchEventType;
  payload: Record<string, unknown>;
  created_at: string;
};
