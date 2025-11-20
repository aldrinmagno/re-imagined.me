export interface AssessmentFormData {
  jobTitle: string;
  industry: string[];
  yearsExperience: string;
  strengths: string[];
  strengthsOther: string;
  typicalWeek: string;
  lookingFor: string | string[];
  workPreferences: string;
  fullName: string;
  email: string;
  password: string;
}

export interface SnapshotInsights {
  workEvolution: string;
  futureDirections: string;
  nextSteps: string;
}
