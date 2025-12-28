export type ApplicationStatus = 'applied' | 'interviewing' | 'offer' | 'rejected';

export type ApplicationRecord = {
  id: string;
  user_id: string;
  company: string;
  role_title: string;
  source: string | null;
  date_applied: string | null;
  status: ApplicationStatus;
  contact: string | null;
  notes: string | null;
  next_step: string | null;
  next_step_date: string | null;
  updated_at: string;
};
