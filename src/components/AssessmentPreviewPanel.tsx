import type { AssessmentFormData, SnapshotInsights } from '../types/assessment';
import { Link } from 'react-router-dom';

type PreviewMode = 'live' | 'full';

interface AssessmentPreviewPanelProps {
  formData: AssessmentFormData;
  goalText: string;
  industryLabel?: string;
  mode: PreviewMode;
  snapshotInsights?: SnapshotInsights | null;
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

const formatStrengths = (strengths: string[]) => strengths.join(', ');

const AssessmentPreviewPanel = ({
  formData,
  goalText,
  industryLabel,
  mode,
  snapshotInsights
}: AssessmentPreviewPanelProps) => {
  const hasLookingFor = Array.isArray(formData.lookingFor)
    ? formData.lookingFor.length > 0
    : Boolean(formData.lookingFor);

  const detailItems = [
    {
      label: 'Current role',
      value: formData.jobTitle,
      placeholder: 'Add your current job title'
    },
    {
      label: 'Industries',
      value: industryLabel ?? '',
      placeholder: 'Choose your industries'
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
      value: hasLookingFor ? goalText : '',
      placeholder: 'Select what you are looking for next'
    }
  ];

  const liveSections = [
    {
      title: 'Strengths we can build on',
      value: truncateCopy(formatStrengths(formData.strengths)),
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
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              {[{
                title: 'How your work may evolve',
                value: snapshotInsights?.workEvolution
              },
              {
                title: 'Potential future directions',
                value: snapshotInsights?.futureDirections
              },
              {
                title: 'Structured next steps',
                value: snapshotInsights?.nextSteps
              }].map((section) => (
                <div
                  key={section.title}
                  className="rounded-2xl border border-transparent bg-white/35 p-6 text-slate-600 ring-1 ring-slate-200/30"
                >
                  <h4 className="mb-3 text-base font-semibold text-slate-700">{section.title}</h4>
                  <p className="text-sm leading-relaxed">
                    {section.value ||
                      'Your personalised AI snapshot will appear here once your answers are saved.'}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-transparent bg-white/25 p-5 text-center text-slate-500 ring-1 ring-slate-200/25">
            <div className="flex flex-col items-center justify-center sm:flex-row">
                {(
                  <Link
                    to="/login"
                    className="w-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-300/30 transition hover:shadow-xl hover:shadow-emerald-200/40 sm:w-auto"
                  >
                    Login to your road map!
                 </Link>
                 )}
                
              </div>

            </div>
            <div className="rounded-2xl border border-transparent bg-white/25 p-5 text-center text-slate-500 ring-1 ring-slate-200/25">
            
              <p className="text-sm">
                These insights are generated automatically based on your responses and will evolve as we collect more signals.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AssessmentPreviewPanel;
