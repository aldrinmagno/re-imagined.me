import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSupabaseClient } from '../../lib/supabaseClient';
import type { AssessmentFormData, SnapshotInsights } from '../../types/assessment';

interface AssessmentRecord {
  id: string;
  job_title: string | null;
  industry: string[] | null;
  years_experience: number | null;
  strengths: string | null;
  typical_week: string | null;
  looking_for: string | null;
  transition_target: string | null;
  work_preferences: string | null;
  email: string | null;
  full_name: string | null;
  snapshot_insights: SnapshotInsights | null;
  submitted_at: string | null;
}

interface ActionPlanProgressRecord {
  action_id: string;
  completed: boolean;
}

const parseJsonArray = (value: string | string[] | null): string[] => {
  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
    } catch (error) {
      console.warn('Unable to parse array field', error);
      return [];
    }
  }

  return [];
};

const buildGoalText = (lookingFor: string[], transitionTarget: string) => {
  const goalLabelMap = {
    strengthen: 'Strengthen and future-proof my current role',
    transition: 'Transition to a new role or discipline',
    explore: 'Explore side projects or additional income streams',
    pioneer: 'Chart a path into roles that do not yet exist at scale'
  } as const;

  const labels = lookingFor
    .map((value) => {
      if (value === 'transition' && transitionTarget) {
        return `${goalLabelMap.transition} (${transitionTarget})`;
      }

      return goalLabelMap[value as keyof typeof goalLabelMap] ?? value;
    })
    .filter(Boolean);

  return labels.length > 0 ? labels.join(', ') : 'your next chapter';
};

const createFallbackFormData = (email: string | null): AssessmentFormData => ({
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
  email: email || '',
  password: ''
});

type FutureRole = {
  title: string;
  reasons: string[];
};

type RoleSkill = {
  role: string;
  summary: string;
  skills: string[];
};

type ActionItem = {
  id: string;
  title: string;
  estimate: string;
};

type ActionPhase = {
  title: string;
  description: string;
  items: ActionItem[];
};

type LearningResource = {
  title: string;
  description: string;
  link: string;
  supports: string;
};

const sampleFutureRoles: FutureRole[] = [
  {
    title: 'AI-Augmented Project Manager',
    reasons: [
      'Blend people leadership with AI-assisted delivery to steer cross-functional teams',
      'Use your stakeholder communication skills to translate strategy into clear milestones'
    ]
  },
  {
    title: 'Customer Insights Analyst',
    reasons: [
      'Pair curiosity with data tools to surface patterns in customer behaviour',
      'Guide teams on which opportunities to pursue based on evidence and empathy'
    ]
  },
  {
    title: 'Product Operations Specialist',
    reasons: [
      'Streamline processes, rituals, and tooling so product teams can ship faster',
      'Bridge product, engineering, and go-to-market partners with clear playbooks'
    ]
  }
];

const roleSkillGroups: RoleSkill[] = [
  {
    role: 'AI-Augmented Project Manager',
    summary: 'Pair delivery leadership with automation and clear communication.',
    skills: [
      'Adaptive planning with AI copilots',
      'Workflow automation fundamentals',
      'Risk and dependency mapping',
      'Stakeholder storytelling'
    ]
  },
  {
    role: 'Customer Insights Analyst',
    summary: 'Translate raw signals into decisions that teams can act on quickly.',
    skills: [
      'Basic SQL and lightweight data cleaning',
      'Survey design and synthesis',
      'Data storytelling with clear visuals',
      'Experiment design for product questions'
    ]
  },
  {
    role: 'Product Operations Specialist',
    summary: 'Keep teams unblocked with crisp rituals, documentation, and metrics.',
    skills: [
      'Notion/Confluence playbook design',
      'Process mapping and iteration',
      'Release readiness checklists',
      'Team health and feedback loops'
    ]
  }
];

const actionPlanPhases: ActionPhase[] = [
  {
    title: 'Month 1 – Foundations',
    description: 'Stabilize your baseline with lightweight systems and clarity on where you are heading.',
    items: [
      { id: 'm1-1', title: 'Draft a 90-day vision and align it with your manager or mentor', estimate: '~1h/week' },
      { id: 'm1-2', title: 'Complete a practical AI-aware project planning course', estimate: '~2h/week' },
      { id: 'm1-3', title: 'Map your current projects and flag 2–3 automation opportunities', estimate: '~1h/week' },
      { id: 'm1-4', title: 'Create a simple operating cadence (weekly review + backlog grooming)', estimate: '~1h/week' }
    ]
  },
  {
    title: 'Month 2 – Momentum',
    description: 'Ship visible wins that link your strengths to the future roles you want.',
    items: [
      { id: 'm2-1', title: 'Pilot an AI-assisted workflow (e.g., drafting briefs, summarising research)', estimate: '~2h/week' },
      { id: 'm2-2', title: 'Publish a short case note on what worked and what you’d change next time', estimate: '~1h/week' },
      { id: 'm2-3', title: 'Shadow or pair with someone already in your target role for one project', estimate: '~1.5h/week' },
      { id: 'm2-4', title: 'Refresh your portfolio or internal wiki with new examples', estimate: '~1h/week' }
    ]
  },
  {
    title: 'Month 3 – Proof',
    description: 'Translate your wins into evidence and set up repeatable habits.',
    items: [
      { id: 'm3-1', title: 'Package a “before and after” story that highlights measurable impact', estimate: '~1h/week' },
      { id: 'm3-2', title: 'Build a reusable template or checklist for your team', estimate: '~1.5h/week' },
      { id: 'm3-3', title: 'Update your LinkedIn headline and bio with the outcomes you delivered', estimate: '~0.5h/week' },
      { id: 'm3-4', title: 'Book a feedback session to validate your next quarter focus', estimate: '~1h/week' }
    ]
  }
];

const learningResources: LearningResource[] = [
  {
    title: 'Adaptive Planning with AI Copilots',
    description: 'A short walkthrough on pairing traditional project planning with AI-assisted estimation.',
    link: 'https://example.com/adaptive-planning',
    supports: 'Skill: Adaptive planning with AI copilots'
  },
  {
    title: 'Workflow Automation Starter Kit',
    description: 'Step-by-step tutorial to automate repetitive updates across your tools.',
    link: 'https://example.com/automation-starter',
    supports: 'Skill: Workflow automation fundamentals'
  },
  {
    title: 'Data Storytelling for Teams',
    description: 'Learn to turn raw insights into crisp narratives that influence decisions.',
    link: 'https://example.com/data-storytelling',
    supports: 'Role: Customer Insights Analyst'
  },
  {
    title: 'Lightweight SQL for Product Questions',
    description: 'Hands-on SQL micro-lessons aimed at PMs and analysts answering real product queries.',
    link: 'https://example.com/sql-for-product',
    supports: 'Skill: Basic SQL and lightweight data cleaning'
  },
  {
    title: 'Rituals for Product Ops Teams',
    description: 'Templates and cadences to keep cross-functional teams unblocked and aligned.',
    link: 'https://example.com/product-ops-rituals',
    supports: 'Role: Product Operations Specialist'
  },
  {
    title: 'Interview-Ready Case Notes',
    description: 'Guide to packaging your projects into concise case stories with measurable impact.',
    link: 'https://example.com/interview-case-notes',
    supports: 'Skill: Stakeholder storytelling'
  }
];

const interviewPitches = [
  'I combine deep experience in cross-functional delivery with a growing toolkit of AI copilots to keep teams moving.',
  'I translate between stakeholders with clear, calm communication and package insights into decisions people can act on.',
  'I look for practical automation wins that save time without sacrificing quality, then share the playbooks with others.',
  'I turn ambiguous goals into lightweight plans, measurable milestones, and stories that highlight impact.',
  'I’m comfortable piloting new tools, learning fast, and teaching teams how to work with them safely.'
];

const interviewTalkingPoints = [
  'Show how your current role already uses the same strengths you’ll need in the next one—like coordinating stakeholders or simplifying messy workflows.',
  'Share a recent project where you adapted quickly to a new process, domain, or tool, and explain the measurable outcome.',
  'Highlight how you’re experimenting with AI or automation to work faster and teach others, even if it’s a small pilot.'
];

const sampleHeadlineSuggestion =
  'Project Manager | Transitioning into AI-augmented Operations | Turning complex workflows into simple systems';

const FutureRoleCard = ({ title, reasons }: FutureRole) => (
  <article className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Future role</p>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
    </div>
    <ul className="space-y-2 text-sm text-slate-200">
      {reasons.map((reason) => (
        <li key={reason} className="flex gap-2">
          <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-300" aria-hidden />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  </article>
);

const RoleSkillsCard = ({ role, summary, skills }: RoleSkill) => (
  <article className="flex h-full flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Skills to build</p>
      <h3 className="text-base font-semibold text-white">{role}</h3>
      <p className="text-sm text-slate-300">{summary}</p>
    </div>
    <ul className="space-y-2 text-sm text-slate-200">
      {skills.map((skill) => (
        <li key={skill} className="flex gap-2 rounded-lg border border-slate-800/70 bg-slate-900/80 px-3 py-2">
          <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-300" aria-hidden />
          <span>{skill}</span>
        </li>
      ))}
    </ul>
  </article>
);

const LearningResourceCard = ({ title, description, link, supports }: LearningResource) => (
  <article className="flex h-full flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
    <div className="space-y-1">
      <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
        Resource
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200">{supports}</span>
      </p>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-300">{description}</p>
    </div>
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
    >
      Open resource
      <span aria-hidden>↗</span>
    </a>
  </article>
);

function Report() {
  const { session } = useAuth();
  const [assessment, setAssessment] = useState<AssessmentFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportId, setReportId] = useState<string | null>(null);
  const [actionProgressByReport, setActionProgressByReport] = useState<Record<string, Set<string>>>({});
  const [progressError, setProgressError] = useState('');

  useEffect(() => {
    if (reportId) {
      setActionProgressByReport((prev) => {
        if (prev[reportId]) return prev;
        return { ...prev, [reportId]: new Set() };
      });
    }
  }, [reportId]);

  useEffect(() => {
    const fetchLatestAssessment = async () => {
      if (!session?.user?.email) {
        setLoading(false);
        setError('We need your session to load your report. Please sign in again.');
        return;
      }

      const supabase = getSupabaseClient();
      const { data, error: fetchError } = await supabase
        .from('assessment_responses')
        .select(
          `id, job_title, industry, years_experience, strengths, typical_week, looking_for, transition_target, work_preferences, email, full_name, snapshot_insights, submitted_at`
        )
        .eq('email', session.user.email)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle<AssessmentRecord>();

      if (fetchError) {
        console.error('Error loading assessment', fetchError);
        setError('We could not load your latest assessment right now. Please try again.');
        setLoading(false);
        return;
      }

      if (!data) {
        setAssessment(createFallbackFormData(session.user.email));
        setReportId(null);
        setLoading(false);
        return;
      }

      const parsedStrengths = parseJsonArray(data.strengths);
      const parsedLookingFor = parseJsonArray(data.looking_for);

      const normalizedFormData: AssessmentFormData = {
        jobTitle: data.job_title || '',
        industry: Array.isArray(data.industry) ? data.industry.filter(Boolean) : [],
        yearsExperience: data.years_experience?.toString() || '',
        strengths: parsedStrengths,
        strengthsOther: '',
        typicalWeek: data.typical_week || '',
        lookingFor: parsedLookingFor,
        transitionTarget: data.transition_target || '',
        workPreferences: data.work_preferences || '',
        fullName: data.full_name || '',
        email: data.email || session.user.email,
        password: ''
      };

      setAssessment(normalizedFormData);
      setReportId(data.id);
      setLoading(false);
    };

    fetchLatestAssessment();
  }, [session]);

  const goalText = useMemo(() => {
    if (!assessment) return '';
    const lookingForArray = Array.isArray(assessment.lookingFor)
      ? (assessment.lookingFor as string[])
      : parseJsonArray(assessment.lookingFor as string | null);
    return buildGoalText(lookingForArray, assessment.transitionTarget);
  }, [assessment]);

  const completedActions = useMemo(() => {
    if (!reportId) return new Set<string>();
    return actionProgressByReport[reportId] ?? new Set<string>();
  }, [actionProgressByReport, reportId]);

  useEffect(() => {
    if (!reportId || !session?.user?.id) return;

    let isCancelled = false;

    const fetchProgress = async () => {
      const supabase = getSupabaseClient();
      const { data, error: fetchError } = await supabase
        .from('action_plan_progress')
        .select('action_id, completed')
        .eq('report_id', reportId)
        .eq('user_id', session.user.id);

      if (fetchError) {
        console.error('Error loading action progress', fetchError);
        setProgressError('We could not load your saved progress right now. You can still use the checkboxes.');
        return;
      }

      if (isCancelled || !data) return;

      const completedIds = new Set(
        (data as ActionPlanProgressRecord[]).filter((row) => row.completed).map((row) => row.action_id)
      );

      setActionProgressByReport((prev) => ({
        ...prev,
        [reportId]: completedIds
      }));
      setProgressError('');
    };

    fetchProgress();

    return () => {
      isCancelled = true;
    };
  }, [reportId, session?.user?.id]);

  const toggleAction = async (id: string) => {
    if (!reportId || !session?.user?.id) return;

    const isCompleted = completedActions.has(id);
    const nextCompleted = !isCompleted;

    setActionProgressByReport((prev) => {
      const existing = prev[reportId] ?? new Set<string>();
      const nextSet = new Set(existing);

      if (nextCompleted) {
        nextSet.add(id);
      } else {
        nextSet.delete(id);
      }

      return { ...prev, [reportId]: nextSet };
    });
    setProgressError('');

    const supabase = getSupabaseClient();
    const { error: upsertError } = await supabase.from('action_plan_progress').upsert(
      {
        user_id: session.user.id,
        report_id: reportId,
        action_id: id,
        completed: nextCompleted,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,report_id,action_id' }
    );

    if (upsertError) {
      console.error('Error saving action progress', upsertError);
      setProgressError('We could not save that change. Please try again.');

      setActionProgressByReport((prev) => {
        const existing = prev[reportId] ?? new Set<string>();
        const nextSet = new Set(existing);

        if (nextCompleted) {
          nextSet.delete(id);
        } else {
          nextSet.add(id);
        }

        return { ...prev, [reportId]: nextSet };
      });
    }
  };

  if (loading) {
    return <p className="text-slate-200">Loading your report…</p>;
  }

  if (error) {
    return <p className="text-red-300">{error}</p>;
  }

  if (!assessment) {
    return <p className="text-slate-200">No assessment found yet. Complete the assessment to see your report.</p>;
  }

  return (
    <div className="space-y-6 text-slate-100">
      <header className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Your personalised report</p>
        <h1 className="text-2xl font-bold text-white">Snapshot of where you are now</h1>
        <p className="text-sm text-slate-300">Latest assessment submitted on your account.</p>
      </header>

      <div className="grid gap-6">
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Where you are now</h2>
            {assessment.fullName ? <span className="text-sm text-slate-400">{assessment.fullName}</span> : null}
          </div>
          <div className="grid gap-4 text-sm text-slate-200 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Role</p>
              <p className="text-base font-semibold text-white">{assessment.jobTitle || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Industry</p>
              <p className="text-base font-semibold text-white">
                {assessment.industry.length > 0 ? assessment.industry.join(', ') : '—'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Experience</p>
              <p className="text-base font-semibold text-white">
                {assessment.yearsExperience ? `${assessment.yearsExperience} years` : '—'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Goals</p>
              <p className="text-base font-semibold text-white">{goalText}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Strengths</p>
              <p className="text-base font-semibold text-white">
                {assessment.strengths.length > 0 ? assessment.strengths.join(', ') : '—'}
              </p>
            </div>
            {assessment.typicalWeek ? (
              <div className="space-y-1 md:col-span-2">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Typical week</p>
                <p className="text-base text-slate-200">{assessment.typicalWeek}</p>
              </div>
            ) : null}
            {assessment.workPreferences ? (
              <div className="space-y-1 md:col-span-2">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Work preferences</p>
                <p className="text-base text-slate-200">{assessment.workPreferences}</p>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Future roles you could grow into</p>
            <h2 className="text-lg font-semibold text-white">Roles to explore based on your strengths</h2>
            <p className="text-sm text-slate-300">
              These examples are tuned for mid-career professionals and can be swapped for personalized matches later.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sampleFutureRoles.map((role) => (
            <FutureRoleCard key={role.title} {...role} />
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Skills to build next</p>
          <h2 className="text-lg font-semibold text-white">Focused skill paths by role</h2>
          <p className="text-sm text-slate-300">
            Each role highlights specific, practice-ready skills so you know exactly what to work on first.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roleSkillGroups.map((roleSkills) => (
            <RoleSkillsCard key={roleSkills.role} {...roleSkills} />
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">90-day action plan</p>
          <h2 className="text-lg font-semibold text-white">A calm, paced plan across three months</h2>
          <p className="text-sm text-slate-300">
            Use the checkboxes to mark progress. Each action includes a light weekly time signal so you can fit it in
            alongside work and life.
          </p>
          {progressError ? <p className="text-sm text-amber-300">{progressError}</p> : null}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {actionPlanPhases.map((phase) => (
            <article
              key={phase.title}
              className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm"
            >
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-300">{phase.title}</p>
                <p className="text-sm text-slate-200">{phase.description}</p>
              </div>
              <ul className="space-y-2">
                {phase.items.map((item) => {
                  const actionId = `action-${item.id}`;
                  const isCompleted = completedActions.has(item.id);

                  return (
                    <li key={item.id}>
                      <label
                        htmlFor={actionId}
                        className={`group flex items-start gap-3 rounded-lg border px-3 py-2 transition hover:border-emerald-400/70 ${
                          isCompleted
                            ? 'border-emerald-400/70 bg-emerald-500/10 text-emerald-50'
                            : 'border-slate-800/70 bg-slate-900/80 text-slate-100'
                        }`}
                      >
                        <input
                          id={actionId}
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => toggleAction(item.id)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden
                          className={`mt-1 flex h-5 w-5 items-center justify-center rounded border text-xs font-semibold transition ${
                            isCompleted
                              ? 'border-emerald-300 bg-emerald-400 text-slate-900'
                              : 'border-slate-600 bg-slate-800 text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium leading-snug">{item.title}</span>
                          <span className="text-xs text-slate-300">{item.estimate} to keep moving</span>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Learning resources</p>
          <h2 className="text-lg font-semibold text-white">Curated support for your next skills</h2>
          <p className="text-sm text-slate-300">
            Each resource is tied to a specific skill or role so you know exactly how it moves you forward.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {learningResources.map((resource) => (
            <LearningResourceCard key={resource.title} {...resource} />
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Interview support</p>
          <h2 className="text-lg font-semibold text-white">How to describe yourself in interviews</h2>
          <p className="text-sm text-slate-300">
            Use these talking points as a calm, confident way to frame your experience and direction.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-slate-200">
          {interviewPitches.map((pitch) => (
            <li key={pitch} className="flex gap-2 rounded-lg border border-slate-800/70 bg-slate-900/80 px-3 py-2">
              <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-300" aria-hidden />
              <span className="leading-snug">{pitch}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-2">
          <h3 className="text-base font-semibold text-white">Talking points for interviews</h3>
          <p className="text-sm text-slate-300">
            Keep these in your back pocket to connect your past work to where you&apos;re headed next.
          </p>
          <ul className="space-y-2 text-sm text-slate-200">
            {interviewTalkingPoints.map((point) => (
              <li key={point} className="flex gap-2 rounded-lg border border-slate-800/60 bg-slate-900/80 px-3 py-2">
                <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-300" aria-hidden />
                <span className="leading-snug">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">LinkedIn headline suggestion</p>
          <h2 className="text-lg font-semibold text-white">Use this as a starting point</h2>
          <p className="text-sm text-slate-300">
            A sample headline crafted for this profile. Swap in your own role, target focus, or proof points when you
            update it later.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/5 p-4 text-sm text-slate-100">
          <p className="font-semibold text-white">{sampleHeadlineSuggestion}</p>
          <p className="mt-2 text-xs text-emerald-200">Designed to be replaced with a dynamic headline soon.</p>
        </div>
      </section>
    </div>
  );
}

export default Report;
