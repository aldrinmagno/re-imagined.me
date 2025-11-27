import { useEffect, useMemo, useState } from 'react';
import AssessmentPreviewPanel from '../../components/AssessmentPreviewPanel';
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

function Report() {
  const { session } = useAuth();
  const [assessment, setAssessment] = useState<AssessmentFormData | null>(null);
  const [snapshotInsights, setSnapshotInsights] = useState<SnapshotInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

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
      setSnapshotInsights(data.snapshot_insights || null);
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

  const toggleAction = (id: string) => {
    setCompletedActions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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

      <section className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Interview support</p>
        <p className="text-base font-semibold text-white">Talking points and headlines pending</p>
        <p className="text-sm text-slate-300">We will add interview talking points and a LinkedIn headline suggestion.</p>
      </section>
    </div>
  );
}

export default Report;
