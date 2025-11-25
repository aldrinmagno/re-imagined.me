import type { AssessmentFormData, SnapshotInsights } from '../types/assessment';
import { Link } from 'react-router-dom';

interface AssessmentPreviewPanelProps {
  formData: AssessmentFormData;
  goalText: string;
  industryLabel?: string;
  mode: 'live' | 'full';
  snapshotInsights?: SnapshotInsights | null;
}

const futureRoles = [
  {
    title: 'AI-Augmented Program Manager',
    reasons: [
      'Blends your delivery discipline with lightweight automation.',
      'Keeps you close to cross-functional teams without heavy coding.'
    ]
  },
  {
    title: 'Product Operations Lead',
    reasons: [
      'Translates product strategy into repeatable rituals.',
      'Plays to your strength in coordinating people, processes, and data.'
    ]
  },
  {
    title: 'Customer Success Strategist',
    reasons: [
      'Uses your stakeholder empathy to shape retention and renewals.',
      'Pairs well with your project background for structured improvements.'
    ]
  }
];

const skillsByRole = [
  {
    role: 'AI-Augmented Program Manager',
    skills: ['Workflow automation basics', 'Prompt design for internal tools', 'Risk and change communication']
  },
  {
    role: 'Product Operations Lead',
    skills: ['Metrics storytelling', 'Experiment ops', 'Lightweight process design']
  },
  {
    role: 'Customer Success Strategist',
    skills: ['Voice-of-customer analysis', 'Success playbooks', 'Executive-ready reporting']
  }
];

const actionPlan = [
  {
    phase: 'Month 1 — Map and measure',
    items: [
      'Audit your current projects for repeatable workflows you can automate.',
      'Shadow a product manager to capture their weekly rituals and metrics.',
      'Host two customer calls focused on goals, not features.'
    ]
  },
  {
    phase: 'Month 2 — Prototype and practice',
    items: [
      'Build a simple automation (e.g., status summaries) using AI-assisted tools.',
      'Draft a lightweight product ops cadence for one team.',
      'Create a success playbook outline based on the customer calls.'
    ]
  },
  {
    phase: 'Month 3 — Ship and socialize',
    items: [
      'Roll out the automation to your squad with clear guardrails.',
      'Share a metrics snapshot and facilitation plan with product leadership.',
      'Pilot the success playbook with two accounts and gather feedback.'
    ]
  }
];

const learningResources = [
  { label: 'Automation mini-course (no-code)', href: '#' },
  { label: 'Product ops rituals template', href: '#' },
  { label: 'Customer interview guide', href: '#' },
  { label: 'Intro to prompt design for ops', href: '#' }
];

const interviewTalkingPoints = [
  'Link AI experimentation to measurable delivery wins.',
  'Show how you translate ambiguity into weekly rituals and checkpoints.',
  'Highlight your ability to calm stakeholders during change.',
  'Emphasize curiosity about tools while keeping people at the center.',
  'Share a story where you turned feedback into a repeatable playbook.'
];

const formatList = (items?: string[]) =>
  items && items.length > 0 ? items.filter(Boolean).join(', ') : undefined;

const AssessmentPreviewPanel = ({
  formData,
  goalText,
  industryLabel,
  mode,
  snapshotInsights
}: AssessmentPreviewPanelProps) => {
  const industriesText = industryLabel || formatList(formData.industry);
  const strengthsText = formatList(formData.strengths);

  const currentStateCopy =
    snapshotInsights?.workEvolution ||
    [
      `${formData.fullName || 'You'}${formData.jobTitle ? ` — ${formData.jobTitle}` : ''}${
        industriesText ? ` in ${industriesText}` : ''
      }.`,
      goalText ? `You want to ${goalText}.` : null,
      strengthsText ? `Key strengths: ${strengthsText}.` : null,
      formData.workPreferences ? `Work preferences: ${formData.workPreferences}.` : null
    ]
      .filter(Boolean)
      .join(' ');

  const futureDirectionsCopy =
    snapshotInsights?.futureDirections ||
    `Use ${strengthsText || 'your strengths'} to ${goalText || 'stay relevant as your industry evolves'}.`;

  const nextStepsCopy =
    snapshotInsights?.nextSteps ||
    `Focus the next 90 days on experiments that show how you deliver value as ${formData.jobTitle || 'your role'} evolves.`;

  const showPersonalizedData = Boolean(snapshotInsights) || mode === 'live';

  return (
    <aside className="rounded-3xl border border-transparent bg-white/50 p-6 shadow-none ring-1 ring-slate-200/60 backdrop-blur-sm lg:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Preview assessment report
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">See the structure of your personalised report</h3>
          <p className="mt-1 text-sm text-slate-600">
            {showPersonalizedData
              ? 'Personalised with your answers and AI-generated insights.'
              : "This is a sample of what you'll receive after the 5-minute assessment."}
          </p>
        </div>
        <Link
          to="/sample-report"
          className="hidden shrink-0 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 lg:inline-flex"
        >
          View a sample report
        </Link>
      </div>

      <div className="mt-8 space-y-6">
        <section className="rounded-2xl bg-white/80 p-5 ring-1 ring-slate-200/70">
          <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Where you are now</h4>
          <p className="mt-2 text-base leading-relaxed text-slate-700">{currentStateCopy}</p>
        </section>

        <section className="rounded-2xl bg-white/80 p-5 ring-1 ring-slate-200/70">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Future roles you could grow into</h4>
            <span className="text-xs font-medium text-emerald-600">3 options</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{futureDirectionsCopy}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {futureRoles.map((role) => (
              <div key={role.title} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <h5 className="text-base font-semibold text-slate-900">{role.title}</h5>
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  {role.reasons.map((reason) => (
                    <li key={reason} className="flex gap-2">
                      <span aria-hidden className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white/80 p-5 ring-1 ring-slate-200/70">
          <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Skills to build next</h4>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {skillsByRole.map((group) => (
              <div key={group.role} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <h5 className="text-sm font-semibold text-slate-900">{group.role}</h5>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {group.skills.map((skill) => (
                    <li key={skill} className="flex gap-2">
                      <span aria-hidden className="mt-[6px] h-1 w-3 rounded-full bg-emerald-500" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white/80 p-5 ring-1 ring-slate-200/70">
          <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">90-day action plan</h4>
          <p className="mt-2 text-sm text-slate-600">{nextStepsCopy}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {actionPlan.map((phase) => (
              <div key={phase.phase} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <h5 className="text-sm font-semibold text-slate-900">{phase.phase}</h5>
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  {phase.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white/80 p-5 ring-1 ring-slate-200/70">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Learning resources</h4>
            <span className="text-xs text-slate-500">Curated to keep momentum</span>
          </div>
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {learningResources.map((resource) => (
              <li key={resource.label} className="flex items-center justify-between rounded-lg bg-slate-50/80 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-100">
                <span>{resource.label}</span>
                <Link to={resource.href} className="text-emerald-600 hover:text-emerald-700">
                  Open
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-white/80 p-5 ring-1 ring-slate-200/70">
          <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">How to talk about yourself in interviews</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {interviewTalkingPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span aria-hidden className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
};

export default AssessmentPreviewPanel;
