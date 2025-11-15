import type { AssessmentFormData } from '../types/assessment';

type PreviewMode = 'live' | 'full';

interface AssessmentPreviewPanelProps {
  formData: AssessmentFormData;
  goalText: string;
  industryLabel?: string;
  mode: PreviewMode;
}

const placeholder = (text: string) => (
  <span className="italic text-slate-400">{text}</span>
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
  mode
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
      className={`rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm shadow-slate-200/40 backdrop-blur ${
        mode === 'full' ? 'lg:p-10' : 'lg:p-8'
      }`}
    >
      <div className="space-y-8">
        <header>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-slate-400">
            {mode === 'full' ? 'Your personalised snapshot' : 'Live assessment preview'}
          </p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900 sm:text-2xl">
            {mode === 'full'
              ? 'Initial snapshot of your next chapter'
              : 'See your snapshot take shape'}
          </h3>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            {mode === 'full'
              ? "You're currently a "
              : 'As you fill in each prompt, we stitch together the key signals that will inform your roadmap.'}
            {mode === 'full' && (
              <>
                <strong className="text-slate-900"> {formData.jobTitle || '—'} </strong>
                {industryLabel && (
                  <>
                    in
                    <strong className="text-slate-900"> {industryLabel}</strong>
                  </>
                )}
                , focusing on
                <strong className="text-slate-900"> {goalText}</strong>.
              </>
            )}
          </p>
        </header>

        <dl className="grid gap-4 rounded-2xl border border-slate-200 bg-white/60 p-5 text-sm text-slate-600">
          {detailItems.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {item.label}
              </dt>
              <dd className="text-base text-slate-900">
                {item.value ? <span className="font-medium">{item.value}</span> : placeholder(item.placeholder)}
              </dd>
            </div>
          ))}
        </dl>

        {mode === 'live' ? (
          <div className="space-y-4">
            {liveSections.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-inner shadow-slate-200/20"
              >
                <h4 className="text-sm font-semibold text-slate-700">{section.title}</h4>
                <p className="mt-2 text-sm text-slate-600">
                  {section.value ? section.value : placeholder(section.placeholder)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm shadow-slate-200/20">
                <h4 className="mb-3 text-lg font-semibold text-slate-900">
                  How your work may evolve
                </h4>
                <p className="text-sm leading-relaxed text-slate-700">
                  As new technologies such as AI, automation, and robotics advance, certain tasks in your role may change. In the full version, we'll help you identify which parts of your work are likely to increase in strategic value.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm shadow-slate-200/20">
                <h4 className="mb-3 text-lg font-semibold text-slate-900">
                  Potential future directions
                </h4>
                <p className="text-sm leading-relaxed text-slate-700">
                  We will suggest both established roles and new, emerging opportunities that align with your strengths and industry knowledge — including roles made possible by AI, humanoid robots, 3D printing, AR/VR, and other innovations.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm shadow-slate-200/20">
                <h4 className="mb-3 text-lg font-semibold text-slate-900">
                  Structured next steps
                </h4>
                <p className="text-sm leading-relaxed text-slate-700">
                  You'll receive a clear, practical 90-day plan outlining skills to focus on, projects to undertake, and ways to position yourself for your next phase.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-5 text-center shadow-inner shadow-slate-200/20">
              <p className="text-sm text-slate-600">
                For this MVP UI, this is a preview only. In the next iteration we'll connect to our backend and AI engine to provide personalised recommendations.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AssessmentPreviewPanel;
