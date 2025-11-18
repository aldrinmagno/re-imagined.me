import type { AssessmentFormData, SnapshotSections } from '../types/assessment';

type PreviewMode = 'live' | 'full';

interface AssessmentPreviewPanelProps {
  formData: AssessmentFormData;
  goalText: string;
  industryLabel?: string;
  mode: PreviewMode;
  snapshotSections?: SnapshotSections;
  snapshotError?: string;
  isGeneratingSnapshot?: boolean;
}

const placeholder = (text: string) => (
  <span className="italic text-slate-300">{text}</span>
);

const truncateCopy = (value: string, length = 140) => {
  if (!value) {
    return '';
  }

  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length).trim()}…`;
};

const AssessmentPreviewPanel = ({
  formData,
  goalText,
  industryLabel,
  mode,
  snapshotSections,
  snapshotError,
  isGeneratingSnapshot
}: AssessmentPreviewPanelProps) => {
  const detailItems = [
    {
      label: 'Current role',
      value: formData.jobTitle,
      placeholder: 'Add your current job title'
    },
    {
      label: 'Industry',
      value: industryLabel ?? '',
      placeholder: 'Choose your industry'
    },
    {
      label: 'Experience',
      value: formData.yearsExperience
        ? `${formData.yearsExperience} year${formData.yearsExperience === '1' ? '' : 's'}`
        : '',
      placeholder: 'How many years of experience?'
    },
    {
      label: 'Primary focus',
      value: formData.lookingFor ? goalText : '',
      placeholder: 'Select what you are looking for next'
    }
  ];

  const liveSections = [
    {
      title: 'Strengths we can build on',
      value: truncateCopy(formData.strengths),
      placeholder:
        'Share the skills, capabilities, or superpowers you rely on most.'
    },
    {
      title: 'Shape of a typical week',
      value: truncateCopy(formData.typicalWeek),
      placeholder:
        'Tell us about the rhythms of your role—projects, rituals, and responsibilities.'
    },
    {
      title: 'Working preferences',
      value: truncateCopy(formData.workPreferences),
      placeholder:
        'Let us know what you want more (or less) of in the next chapter.'
    }
  ];

  return (
    <aside
      className={`rounded-3xl border border-transparent bg-white/40 p-5 shadow-none ring-1 ring-slate-200/40 backdrop-blur-sm ${
        mode === 'full' ? 'lg:p-9' : 'lg:p-7'
      }`}
    >
      <div className="space-y-8">
        <header>
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-slate-400">
            {mode === 'full' ? 'Your personalised snapshot' : 'Live assessment preview'}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-800 sm:text-xl">
            {mode === 'full'
              ? 'Initial snapshot of your next chapter'
              : 'See your snapshot take shape'}
          </h3>
          <p className="mt-2 text-sm text-slate-500 sm:text-sm">
            {mode === 'full'
              ? "You're currently a "
              : 'As you fill in each prompt, we stitch together the key signals that will inform your roadmap.'}
            {mode === 'full' && (
              <>
                <span className="font-medium text-slate-700"> {formData.jobTitle || '—'} </span>
                {industryLabel && (
                  <>
                    in
                    <span className="font-medium text-slate-700"> {industryLabel}</span>
                  </>
                )}
                , focusing on
                <span className="font-medium text-slate-700"> {goalText}</span>.
              </>
            )}
          </p>
        </header>

        <dl className="grid gap-4 rounded-2xl border border-transparent bg-white/30 p-4 text-sm text-slate-500 ring-1 ring-slate-200/30">
          {detailItems.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {item.label}
              </dt>
              <dd className="text-base text-slate-700">
                {item.value ? <span className="font-medium text-slate-700">{item.value}</span> : placeholder(item.placeholder)}
              </dd>
            </div>
          ))}
        </dl>

        {mode === 'live' ? (
          <div className="space-y-4">
            {liveSections.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-transparent bg-white/30 p-4 text-slate-500 ring-1 ring-slate-200/25"
              >
                <h4 className="text-sm font-semibold text-slate-600">{section.title}</h4>
                <p className="mt-2 text-sm text-slate-500">
                  {section.value ? section.value : placeholder(section.placeholder)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {[
              {
                key: 'evolution',
                title: 'How your work may evolve',
                placeholderText:
                  'Once generated, you’ll see how your current role could stretch over the next few years.'
              },
              {
                key: 'directions',
                title: 'Potential future directions',
                placeholderText:
                  'We’ll suggest distinct paths to explore based on your goals and strengths.'
              },
              {
                key: 'nextSteps',
                title: 'Structured next steps',
                placeholderText:
                  'Expect a concrete, near-term action you can take to build momentum.'
              }
            ].map((section) => (
              <div
                key={section.key}
                className="rounded-2xl border border-transparent bg-white/35 p-6 text-slate-600 ring-1 ring-slate-200/30"
              >
                <h4 className="mb-3 text-base font-semibold text-slate-700">{section.title}</h4>
                <p className="text-base leading-relaxed text-slate-700">
                  {isGeneratingSnapshot
                    ? 'We’re crafting your personalised snapshot based on your responses…'
                    : snapshotSections?.[section.key as keyof SnapshotSections]
                        ? snapshotSections[section.key as keyof SnapshotSections]
                        : placeholder(section.placeholderText)}
                </p>
              </div>
            ))}
            {snapshotError && (
              <p className="text-sm text-red-600">
                {snapshotError}
              </p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default AssessmentPreviewPanel;
