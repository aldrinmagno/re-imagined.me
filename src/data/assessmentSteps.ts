import type { AssessmentFormData } from '../types/assessment';

export type StepType = 'input' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'signup';

export type InputModeType =
  | 'none'
  | 'text'
  | 'tel'
  | 'url'
  | 'email'
  | 'numeric'
  | 'decimal'
  | 'search';

export interface StepDefinition {
  id: keyof AssessmentFormData;
  title: string;
  prompt: string;
  type: StepType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string; description?: string }[];
  rows?: number;
  helperText?: string;
  inputMode?: InputModeType;
  inputType?: string;
}

export const assessmentSteps: StepDefinition[] = [
  {
    id: 'jobTitle',
    title: 'Who you are at work',
    prompt: 'What is your current job title?',
    type: 'input',
    required: true,
    placeholder: 'e.g., Senior Product Manager'
  },
  {
    id: 'industry',
    title: 'Your context',
    prompt: 'Which industries are you working in?',
    type: 'multiselect',
    required: true,
    placeholder: 'Select your industries',
    options: [
      { value: 'software-tech', label: 'Software / Tech' },
      { value: 'design-creative', label: 'Design / Creative' },
      { value: 'marketing-sales', label: 'Marketing / Sales' },
      { value: 'Banking / Financial Services', label: 'Banking / Financial Services' },
      { value: 'finance-accounting', label: 'Finance / Accounting' },
      { value: 'operations-admin', label: 'Operations / Admin' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'education-training', label: 'Education / Training' },
      { value: 'public-nonprofit', label: 'Public Sector / Nonprofit' },
      { value: 'other', label: 'Other' }
    ]
  },
  {
    id: 'yearsExperience',
    title: 'Experience snapshot',
    prompt: 'How many years of experience do you have?',
    type: 'input',
    required: true,
    inputType: 'number',
    placeholder: 'e.g., 8',
    helperText: 'Enter a whole number. If less than one year, enter 0.'
  },
  {
    id: 'strengths',
    title: 'Your strengths & skills',
    prompt: 'What do you consider your core strengths and skills?',
    type: 'multiselect',
    required: true,
    helperText: 'Select all that apply — you can choose multiple.',
    options: [
      { value: 'leadership', label: 'Leadership & people management' },
      { value: 'stakeholder-communication', label: 'Stakeholder communication' },
      { value: 'product-strategy', label: 'Product strategy' },
      { value: 'user-research', label: 'User research' },
      { value: 'data-analysis', label: 'Data analysis & insights' },
      { value: 'technical-architecture', label: 'Technical architecture' },
      { value: 'project-delivery', label: 'Project management & delivery' },
      { value: 'design-thinking', label: 'Design thinking & UX' },
      { value: 'sales-partnerships', label: 'Sales & partnerships' },
      { value: 'process-optimisation', label: 'Process optimisation' },
      { value: 'coaching-mentoring', label: 'Coaching & mentoring' },
      { value: 'writing-storytelling', label: 'Writing & storytelling' },
      { value: 'other', label: 'Other (write manually)' }
    ]
  },
  {
    id: 'typicalWeek',
    title: 'Your day-to-day',
    prompt: 'What does a typical workweek look like for you?',
    type: 'textarea',
    rows: 5,
    helperText:
      'Optional — outline key tasks and time patterns (e.g., 50% client meetings, 30% analysis, 20% admin; mornings for deep work; on-site Tue–Thu).'
  },
  {
    id: 'lookingFor',
    title: 'Your direction',
    prompt: 'What are you mainly looking for right now?',
    type: 'multiselect',
    required: true,
    helperText: 'Select all that apply to your current priorities.',
    options: [
      { value: 'pioneer', label: 'Chart a path into roles that do not yet exist at scale' },
      { value: 'strengthen', label: 'Strengthen and future-proof my current role' },
      { value: 'transition', label: 'Transition to a new role or discipline' },
      { value: 'explore', label: 'Explore side projects or additional income streams' }
    ]
  },
  {
    id: 'workPreferences',
    title: 'Designing your next chapter',
    prompt: 'What would you like to see more (or less) of in your work?',
    type: 'textarea',
    rows: 4,
    helperText: 'Optional — e.g., more ownership, more creativity, more stability, less routine work…'
  },
  {
    id: 'email',
    title: 'Create your account',
    prompt: 'Sign up to save your roadmap and unlock your personalised plan.',
    type: 'signup',
    required: true
  }
];

export const goalLabelMap = {
  strengthen: 'Strengthen and future-proof my current role',
  transition: 'Transition to a new role or discipline',
  explore: 'Explore side projects or additional income streams',
  pioneer: 'Chart a path into roles that do not yet exist at scale'
} as const;

export const createInitialFormData = (): AssessmentFormData => ({
  jobTitle: '',
  industry: [],
  yearsExperience: '',
  strengths: [],
  strengthsOther: '',
  typicalWeek: '',
  lookingFor: [],
  transitionTarget: '',
  workPreferences: '',
  fullName: '',
  email: '',
  password: ''
});
