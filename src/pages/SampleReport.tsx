import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface FutureRole {
  title: string;
  reasons: string[];
}

interface SkillsGroup {
  role: string;
  skills: string[];
}

interface ActionPhase {
  title: string;
  actions: string[];
}

interface ResourceLink {
  title: string;
  url: string;
  note?: string;
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Report section</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-2 text-sm text-slate-700">{description}</p> : null}
        </div>
      </div>
      <div className="mt-6 space-y-4 text-slate-800">{children}</div>
    </section>
  );
}

function SampleReport() {
  const currentRoleSummary =
    "Sam – mid-level project manager keeping cross-functional teams aligned, now worried about AI changing stakeholder expectations and delivery speed.";

  const futureRoles: FutureRole[] = [
    {
      title: 'Product Operations Lead',
      reasons: [
        'Translates strategy into repeatable rituals that keep teams aligned.',
        'Strong at smoothing handoffs and making delivery measurable.'
      ]
    },
    {
      title: 'AI-Augmented Project Manager',
      reasons: [
        'Pairs delivery skills with lightweight automation and prompt-writing.',
        'Comfortable guiding stakeholders through AI-supported workflows.'
      ]
    },
    {
      title: 'Customer Programs Manager',
      reasons: [
        'Uses communication strengths to run pilot programs and capture feedback.',
        'Connects customer insights to roadmap priorities without heavy coding.'
      ]
    }
  ];

  const skillsByRole: SkillsGroup[] = [
    {
      role: 'Product Operations Lead',
      skills: ['Operating cadence design', 'Metrics storytelling', 'Meeting facilitation', 'Workflow mapping in FigJam or Miro']
    },
    {
      role: 'AI-Augmented Project Manager',
      skills: ['Prompt design for summaries & risks', 'Automation basics in Notion or Zapier', 'Change management', 'Data hygiene best practices']
    },
    {
      role: 'Customer Programs Manager',
      skills: ['Customer interview scripting', 'Pilot success metrics', 'Stakeholder updates', 'Lightweight experimentation']
    }
  ];

  const actionPlan: ActionPhase[] = [
    {
      title: 'Month 1 — Stabilise and map',
      actions: [
        'Document your current rituals, meetings, and decision points in a simple service blueprint.',
        'Create a “before/after” update template to show how AI support could save time.',
        'Run two short interviews with stakeholders about their biggest delivery friction.'
      ]
    },
    {
      title: 'Month 2 — Pilot and learn',
      actions: [
        'Test one AI-assisted workflow (status updates or risk summaries) and track minutes saved.',
        'Host a 30-minute playback with your team to collect feedback on the pilot.',
        'Draft success metrics for a broader rollout and get sign-off from your manager.'
      ]
    },
    {
      title: 'Month 3 — Scale and showcase',
      actions: [
        'Package the pilot into a reusable playbook with screenshots and prompts.',
        'Share a short narrative: problem, experiment, results, and what you’ll refine next.',
        'Identify one teammate to co-own the next automation so the practice outlives you.'
      ]
    }
  ];

  const resources: ResourceLink[] = [
    { title: 'AI for project leads — quick prompts', url: '#', note: '5-minute prompt patterns for risks and updates' },
    { title: 'Running effective stakeholder updates', url: '#', note: 'Lightweight template with example phrasing' },
    { title: 'Automation starters in Notion', url: '#', note: 'Beginner-friendly walkthroughs—no code required' },
    { title: 'Metrics that matter for delivery teams', url: '#', note: 'Common KPIs and how to report on them' }
  ];

  const interviewTalkingPoints = [
    'I translate strategy into clear rituals so teams move in sync.',
    'I’ve piloted AI-assisted status updates that cut prep time by ~30%.',
    'Stakeholders trust me to surface risks early with concise narratives.',
    'I pair delivery discipline with lightweight experimentation to learn fast.'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 left-10 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-4 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        </div>
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-800 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
            >
              ← Back to home
            </Link>
            <span className="hidden text-slate-400 sm:inline" aria-hidden>
              ·
            </span>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 sm:text-sm">Preview only</p>
          </div>

          <header className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Sample report</p>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              See the kind of clarity you&apos;ll receive after your assessment
            </h1>
            <p className="max-w-3xl text-lg text-slate-700">
              This read-only example shows how we summarise where you are today, the roles that fit, and the concrete steps to move
              forward. Your personalised report will adapt to your strengths and the pace you prefer.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 font-semibold text-emerald-700 shadow-sm">
                5-minute assessment → instant plan
              </span>
              <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 font-semibold text-slate-700 shadow-sm">
                Subscription: $15–$25/month
              </span>
            </div>
          </header>

          <div className="grid gap-8">
            <SectionCard title="Where you are now" description="Grounded in your current role so recommendations feel realistic.">
              <p className="leading-relaxed text-slate-800">{currentRoleSummary}</p>
            </SectionCard>

            <SectionCard title="Future roles you could grow into" description="3 options, each with a clear reason it fits.">
              <div className="grid gap-4 sm:grid-cols-2">
                {futureRoles.map((role) => (
                  <div
                    key={role.title}
                    className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:border-emerald-200"
                  >
                    <h3 className="text-lg font-semibold text-slate-900">{role.title}</h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                      {role.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Skills to build next" description="Grouped by role so you know what to practice first.">
              <div className="space-y-4">
                {skillsByRole.map((group) => (
                  <div key={group.role} className="rounded-xl border border-slate-200 bg-white/70 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{group.role}</h3>
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Focus</span>
                    </div>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {group.skills.map((skill) => (
                        <li key={skill} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="90-day action plan" description="Three calm, achievable monthly phases.">
              <div className="grid gap-4 sm:grid-cols-3">
                {actionPlan.map((phase) => (
                  <div key={phase.title} className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{phase.title}</p>
                    <ul className="mt-3 space-y-2">
                      {phase.actions.map((action) => (
                        <li key={action} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                            ✓
                          </span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Learning resources" description="Compact, practical links to keep momentum.">
              <ul className="grid gap-3 sm:grid-cols-2">
                {resources.map((resource) => (
                  <li key={resource.title} className="rounded-xl border border-slate-200 bg-white/70 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <a
                        href={resource.url}
                        className="text-base font-semibold text-emerald-700 underline decoration-emerald-300/70 transition hover:text-emerald-600"
                      >
                        {resource.title}
                      </a>
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">5–10 mins</span>
                    </div>
                    {resource.note ? <p className="mt-2 text-sm text-slate-700">{resource.note}</p> : null}
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="How to talk about yourself in interviews" description="Ready-to-use lines for intros and stories.">
              <ul className="space-y-3">
                {interviewTalkingPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-base text-slate-800">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-sky-50 p-6 text-center shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold text-slate-900">Ready for your personalised version?</h2>
            <p className="mt-2 text-base text-slate-700">
              Start the 5-minute assessment to get roles, a 90-day plan, and resources tailored to you.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-200/50 transition hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
              >
                Start my 5-minute assessment
              </Link>
              <span className="text-sm font-medium text-slate-600">Subscription $15–$25/month after trial.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SampleReport;
