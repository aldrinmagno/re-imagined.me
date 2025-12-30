export type RadarItemType = 'company' | 'recruiter' | 'institution';
export type RadarItemStatus = 'watching' | 'applied' | 'interviewing';

export type RadarItemMeta = {
  fit_notes: string;
  tags: string[];
};

export type RadarItemRecord = {
  id: string;
  user_id: string;
  type: RadarItemType;
  name: string;
  link: string | null;
  priority: number;
  status: RadarItemStatus;
  meta: RadarItemMeta;
  updated_at: string;
};
