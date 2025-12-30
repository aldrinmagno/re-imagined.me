export type CvBulletsPayload = {
  mostRelevant: string[];
  supporting: string[];
};

export type CvBulletsRecord = {
  id: string;
  user_id: string;
  role_key: string;
  bullets: CvBulletsPayload;
  updated_at: string;
};
