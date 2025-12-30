export type TransferableSkill = {
  name: string;
  evidence: string;
  confidence: number;
};

export type TransferableSkillsResult = {
  transferable_skills: TransferableSkill[];
  impact_bullets: string[];
};

export type TransferableSkillsSnapshotRecord = {
  id: string;
  user_id: string;
  skills: TransferableSkill[];
  bullets: string[];
  created_at: string;
};
