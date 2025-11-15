import type { AssessmentFormData } from '../types/assessment';

interface AssessmentPreviewProps {
  formData: AssessmentFormData;
  currentStep: number;
  showSnapshot: boolean;
}

const industryLabelMap: Record<string, string> = {
  'software-tech': 'Software / Tech',
  'design-creative': 'Design / Creative',
  'marketing-sales': 'Marketing / Sales',
  'finance-accounting': 'Finance / Accounting',
  'operations-admin': 'Operations / Admin',
  healthcare: 'Healthcare',
  'education-training': 'Education / Training',
  'public-nonprofit': 'Public Sector / Nonprofit',
  other: 'Other'
};

const goalCopyMap: Record<string, string> = {
  pioneer: 'Chart a path into roles that do not yet exist at scale',
  strengthen: 'Strengthen and future-proof my current role',
  transition: 'Transition to a new role or discipline',
  explore: 'Explore side projects or additional income streams'
};

const placeholders = {
  jobTitle: 'your current job title',
  industry: 'your industry',
  yearsExperience: 'how many years of experience you have',
  strengths: 'Share the strengths you lean on most',
  typicalWeek: 'Describe what a typical workweek involves',
  lookingFor: 'Tell us what you would like to focus on next',
  workPreferences: 'Note anything you would like more or less of in your work',
  email: 'Add the email where we should send your roadmap'
};

const formatValue = (value: string, placeholder: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : placeholder;
};

const formatIndustry = (value: string) => {
  if (!value.trim()) return placeholders.industry;
  return industryLabelMap[value] ?? value.replace(/-/g, ' ');
};

const formatGoalText = (value: string) => {
  if (!value.trim()) return placeholders.lookingFor;
  return goalCopyMap[value] ?? value;
};

const AssessmentPreview = ({ formData, currentStep, showSnapshot }: AssessmentPreviewProps) => {
  const formattedGoal = formatGoalText(formData.lookingFor);

  if (showSnapshot) {
    const summaryText = `You're currently a ${formatValue(formData.jobTitle, 'seasoned professional')} in ${formatIndustry(formData.industry)}, and you're focused on: ${formattedGoal}.`;

    return (
      <div className="space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Initial snapshot of your next chapter
          </h2>
          <p className="text-lg text-slate-700 bg-slate-50 p-6 rounded-lg border border-slate-200">
            {summaryText}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 text-left">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              How your work may evolve
            </h3>
            <p className="text-slate-700">
              As new technologies such as AI, automation, and robotics advance, certain tasks in your role may change. In the full version, we'll help you identify which parts of your work are likely to increase in strategic value.
            </p>
          </div>

          <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 text-left">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Potential future directions
            </h3>
            <p className="text-slate-700">
              We will suggest both established roles and new, emerging opportunities that align with your strengths and industry knowledge — including roles made possible by AI, humanoid robots, 3D printing, AR/VR, and other innovations.
            </p>
          </div>

          <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 text-left">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Structured next steps
            </h3>
            <p className="text-slate-700">
              You'll receive a clear, practical 90-day plan outlining skills to focus on, projects to undertake, and ways to position yourself for your next phase.
            </p>
          </div>
        </div>

        <div className="bg-slate-100 p-6 rounded-lg border border-slate-300 text-center">
          <p className="text-slate-700">
            For this MVP UI, this is a preview only. In the next iteration we'll connect to our backend and AI engine to provide personalised recommendations.
          </p>
        </div>
      </div>
    );
  }

  const fieldSummaries = [
    {
      label: 'Current role',
      value: `${formatValue(formData.jobTitle, placeholders.jobTitle)} in ${formatIndustry(formData.industry)}`
    },
    {
      label: 'Experience',
      value: formatValue(
        formData.yearsExperience,
        'Add how many years of experience you have'
      )
    },
    {
      label: 'Focus',
      value: formattedGoal
    },
    {
      label: 'Strengths snapshot',
      value: formatValue(formData.strengths, placeholders.strengths)
    },
    {
      label: 'Typical week',
      value: formatValue(formData.typicalWeek, placeholders.typicalWeek)
    },
    {
      label: 'Work preferences',
      value: formatValue(formData.workPreferences, placeholders.workPreferences)
    },
    {
      label: 'Roadmap delivery',
      value: formatValue(formData.email, placeholders.email)
    }
  ];

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs uppercase tracking-wide text-slate-500">
        <span>Snapshot preview</span>
        <span>Question {currentStep + 1} of 8</span>
      </div>

      <div className="mt-4 space-y-4">
        <p className="text-sm text-slate-600">
          Your answers build a personalised snapshot. We'll turn what you share into insights about how your role is evolving and what to do next.
        </p>

        <div className="space-y-3">
          {fieldSummaries.map((field) => (
            <div key={field.label} className="rounded-2xl bg-slate-50/80 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {field.label}
              </p>
              <p className="mt-1 text-sm text-slate-700 leading-relaxed">
                {field.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 p-4 text-sm text-slate-600">
          Expect highlights on how your work may evolve, potential future directions, and structured next steps once you complete the assessment.
        </div>
      </div>
    </aside>
  );
};

export default AssessmentPreview;
