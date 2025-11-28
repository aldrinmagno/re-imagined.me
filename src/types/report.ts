export interface FutureRole {
  id: string;
  title: string;
  reasons: string[];
  description?: string | null;
}

export interface RoleSkillGroup {
  roleId?: string | null;
  role: string;
  summary?: string | null;
  skills: string[];
}

export interface ActionItem {
  id: string;
  title: string;
  estimate?: string | null;
}

export interface ActionPhase {
  id: string;
  title: string;
  monthLabel?: string | null;
  description?: string | null;
  items: ActionItem[];
}

export interface LearningResource {
  id: string;
  title: string;
  description?: string | null;
  link: string;
  supports?: string | null;
}

export interface InterviewContent {
  headline?: string | null;
  pitches: string[];
  talkingPoints: string[];
}

export interface ReportContent {
  futureRoles: FutureRole[];
  roleSkillGroups: RoleSkillGroup[];
  actionPlanPhases: ActionPhase[];
  learningResources: LearningResource[];
  interview: InterviewContent | null;
}
