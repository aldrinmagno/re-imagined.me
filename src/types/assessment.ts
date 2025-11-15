export interface AssessmentFormData {
  jobTitle: string;
  industry: string;
  yearsExperience: string;
  strengths: string;
  typicalWeek: string;
  lookingFor: string;
  workPreferences: string;
  email: string;
}

export const createInitialAssessmentFormData = (): AssessmentFormData => ({
  jobTitle: '',
  industry: '',
  yearsExperience: '',
  strengths: '',
  typicalWeek: '',
  lookingFor: '',
  workPreferences: '',
  email: ''
});
