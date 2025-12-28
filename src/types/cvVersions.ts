export type CvVersionContent = {
  headline: string;
  summary: string;
  top_skills: string[];
  bullets: string[];
};

export type CvVersionRecord = {
  id: string;
  user_id: string;
  name: string;
  role_key: string;
  content: CvVersionContent;
  updated_at: string;
};
