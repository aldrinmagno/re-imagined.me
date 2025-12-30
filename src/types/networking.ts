export type NetworkContactRecord = {
  id: string;
  user_id: string;
  name: string;
  org: string | null;
  role: string | null;
  channel: string | null;
  last_contacted: string | null;
  next_follow_up: string | null;
  notes: string | null;
  updated_at: string;
};

export type NetworkTaskStatus = 'pending' | 'done';

export type NetworkTaskRecord = {
  id: string;
  user_id: string;
  task: string;
  due_date: string | null;
  status: NetworkTaskStatus;
  linked_contact_id: string | null;
  updated_at: string;
};

export type OutreachTemplate = {
  id: string;
  label: string;
  content: string;
};
