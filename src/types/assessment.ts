export interface AssessmentFormData {
  jobTitle: string;
  industry: string[];
  yearsExperience: string;
  strengths: string[];
  strengthsOther: string;
  typicalWeek: string;
  lookingFor: string | string[];
  transitionTarget: string;
  workPreferences: string;
  fullName: string;
  email: string;
  password: string;
}

export interface SnapshotInsights {
  workEvolution: string;
  futureDirections: string;
  nextSteps: string;
  futureRoles: {
    title: string;
    reasons: string[];
  }[];
  skillsByRole: {
    role: string;
    skills: string[];
  }[];
  actionPlan: {
    phase: string;
    items: string[];
  }[];
  learningResources: {
    label: string;
    href: string;
  }[];
  interviewTalkingPoints: string[];
}
