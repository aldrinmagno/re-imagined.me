export type ActionPlanCategory = 'upskill' | 'cv' | 'application' | 'networking' | 'interview_prep';

export type ActionPlanWeek = {
  id: string;
  label: string;
  tasks: Record<ActionPlanCategory, string>;
  completed: Record<ActionPlanCategory, boolean>;
};

export type ActionPlanData = {
  weeks: ActionPlanWeek[];
};

export type ActionPlanRecord = {
  id: string;
  user_id: string;
  plan: ActionPlanData;
  updated_at: string;
};
