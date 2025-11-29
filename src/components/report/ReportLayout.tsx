import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSupabaseClient } from '../../lib/supabaseClient';
import type { AssessmentFormData, SnapshotInsights } from '../../types/assessment';
import type {
  ActionPhase,
  InterviewContent,
  LearningResource,
  ReportContent,
  RoleSkillGroup
} from '../../types/report';

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

interface ReportRecord {
  id: string;
  assessment_id: string;
  goal_text: string | null;
  headline_suggestion: string | null;
  interview_overview: string | null;
}

interface FutureRoleRecord {
  id: string;
  title: string;
  description: string | null;
  reasons: string[] | null;
  ordering: number | null;
}

interface SkillRecord {
  id: string;
  future_role_id: string | null;
  skill_name: string;
  skill_summary: string | null;
  ordering: number | null;
}

interface PlanPhaseRecord {
  id: string;
  month_label: string | null;
  title: string;
  description: string | null;
  position: number | null;
}

interface PlanActionRecord {
  id: string;
  phase_id: string;
  label: string;
  time_per_week: string | null;
  position: number | null;
}

interface LearningResourceRecord {
  id: string;
  title: string;
  description: string | null;
  url: string;
  tags: string[] | null;
  position: number | null;
}

interface InterviewRecord {
  id: string;
  headline: string | null;
  how_to_describe: string | null;
  talking_points: string[] | null;
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

const splitLines = (value: string | null | undefined) => {
  if (!value) return [] as string[];

  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const createEmptyReportContent = (): ReportContent => ({
  futureRoles: [],
  roleSkillGroups: [],
  actionPlanPhases: [],
  learningResources: [],
  interview: null
});

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

export const reportSectionLinks = [
  { to: 'overview', label: 'Overview' },
  { to: 'plan', label: 'Plan' },
  { to: 'resources', label: 'Resources' },
  { to: 'interview', label: 'Interview' }
];

type ReportContextValue = {
  assessment: AssessmentFormData;
  goalText: string;
  completedActions: Set<string>;
  toggleAction: (id: string) => Promise<void>;
  progressError: string;
  reportContent: ReportContent;
};

const ReportContext = createContext<ReportContextValue | undefined>(undefined);

export const useReportContext = () => {
  const context = useContext(ReportContext);

  if (!context) {
    throw new Error('useReportContext must be used within a ReportLayout');
  }

  return context;
};

function ReportLayout() {
  const { session } = useAuth();
  const [assessment, setAssessment] = useState<AssessmentFormData | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionProgressByAssessment, setActionProgressByAssessment] = useState<Record<string, Set<string>>>({});
  const [progressError, setProgressError] = useState('');
  const [reportContent, setReportContent] = useState<ReportContent>(createEmptyReportContent());
  const [contentError, setContentError] = useState('');

  const loadReportContent = async (report: ReportRecord) => {
    const supabase = getSupabaseClient();
    setContentError('');

    const [futureRolesResponse, skillsResponse, phasesResponse, actionsResponse, resourcesResponse, interviewResponse] =
      await Promise.all([
        supabase
          .from('future_roles')
          .select('id, title, description, reasons, ordering')
          .eq('report_id', report.id)
          .order('ordering', { ascending: true }),
        supabase
          .from('skills_to_build')
          .select('id, future_role_id, skill_name, skill_summary, ordering')
          .eq('report_id', report.id)
          .order('ordering', { ascending: true }),
        supabase
          .from('ninety_day_plan_phases')
          .select('id, month_label, title, description, position')
          .eq('report_id', report.id)
          .order('position', { ascending: true }),
        supabase
          .from('plan_actions')
          .select('id, phase_id, label, time_per_week, position')
          .eq('report_id', report.id)
          .order('position', { ascending: true }),
        supabase
          .from('learning_resources')
          .select('id, title, description, url, tags, position')
          .eq('report_id', report.id)
          .order('position', { ascending: true }),
        supabase
          .from('interview_data')
          .select('id, headline, how_to_describe, talking_points')
          .eq('report_id', report.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle<InterviewRecord>()
      ]);

    const firstError =
      futureRolesResponse.error ||
      skillsResponse.error ||
      phasesResponse.error ||
      actionsResponse.error ||
      resourcesResponse.error ||
      interviewResponse.error;

    if (firstError) {
      console.error('Error loading report content', firstError);
      setContentError('We could not load all report content right now. Please refresh to try again.');
      setReportContent(createEmptyReportContent());
      return;
    }

    const futureRoles = (futureRolesResponse.data as FutureRoleRecord[] | null)?.map((role) => ({
      id: role.id,
      title: role.title,
      description: role.description,
      reasons: Array.isArray(role.reasons) ? role.reasons.filter(Boolean) : [],
      ordering: role.ordering ?? 0
    })) as (FutureRoleRecord & { ordering: number })[];

    const orderedRoles = (futureRoles || []).sort((a, b) => a.ordering - b.ordering);
    const roleLookup = new Map(orderedRoles.map((role) => [role.id, role]));

    const skills = (skillsResponse.data as SkillRecord[] | null) || [];
    const groupedSkills: Record<string, RoleSkillGroup & { order: number }> = {};

    orderedRoles.forEach((role, index) => {
      groupedSkills[role.id] = {
        roleId: role.id,
        role: role.title,
        summary: role.description,
        skills: [],
        order: role.ordering ?? index
      };
    });

    skills.forEach((skill) => {
      const role = skill.future_role_id ? roleLookup.get(skill.future_role_id) : undefined;
      const key = role?.id ?? 'general';

      if (!groupedSkills[key]) {
        groupedSkills[key] = {
          roleId: role?.id,
          role: role?.title || 'Focus areas',
          summary: role?.description || skill.skill_summary,
          skills: [],
          order: role?.ordering ?? skills.indexOf(skill)
        };
      }

      groupedSkills[key].skills.push(skill.skill_name);

      if (!groupedSkills[key].summary && skill.skill_summary) {
        groupedSkills[key].summary = skill.skill_summary;
      }
    });

    const planPhases = (phasesResponse.data as PlanPhaseRecord[] | null) || [];
    const planActions = (actionsResponse.data as PlanActionRecord[] | null) || [];

    const actionsByPhase = planActions.reduce<Record<string, PlanActionRecord[]>>((acc, action) => {
      if (!acc[action.phase_id]) acc[action.phase_id] = [];
      acc[action.phase_id].push(action);
      return acc;
    }, {});

    const actionPlanPhases: ActionPhase[] = planPhases.map((phase) => {
      const title = phase.month_label ? `${phase.month_label} – ${phase.title}` : phase.title;
      const items = (actionsByPhase[phase.id] || [])
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((action) => ({
          id: action.id,
          title: action.label,
          estimate: action.time_per_week
        }));

      return {
        id: phase.id,
        title,
        monthLabel: phase.month_label,
        description: phase.description,
        items
      };
    });

    const learningResources: LearningResource[] = ((resourcesResponse.data as LearningResourceRecord[] | null) || []).map(
      (resource) => ({
        id: resource.id,
        title: resource.title,
        description: resource.description,
        link: resource.url,
        supports: Array.isArray(resource.tags) ? resource.tags.filter(Boolean).join(', ') : null
      })
    );

    const interviewRow = interviewResponse.data as InterviewRecord | null;
    let interview: InterviewContent | null = null;

    if (interviewRow) {
      interview = {
        headline: interviewRow.headline || report.headline_suggestion,
        pitches: splitLines(interviewRow.how_to_describe || report.interview_overview),
        talkingPoints: Array.isArray(interviewRow.talking_points) ? interviewRow.talking_points.filter(Boolean) : []
      };
    } else if (report.headline_suggestion || report.interview_overview) {
      interview = {
        headline: report.headline_suggestion,
        pitches: splitLines(report.interview_overview),
        talkingPoints: []
      };
    }

    setReportContent({
      futureRoles: orderedRoles.map((role) => {
        const { ordering, reasons, ...rest } = role;
        void ordering;

        return {
          ...rest,
          reasons: Array.isArray(reasons) ? reasons.filter(Boolean) : []
        };
      }),
      roleSkillGroups: Object.values(groupedSkills)
        .sort((a, b) => a.order - b.order)
        .map((group) => {
          const { order, ...rest } = group;
          void order;

          return rest;
        }),
      actionPlanPhases,
      learningResources,
      interview
    });
  };

  useEffect(() => {
    if (assessmentId) {
      setActionProgressByAssessment((prev) => {
        if (prev[assessmentId]) return prev;
        return { ...prev, [assessmentId]: new Set() };
      });
    }
  }, [assessmentId]);

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
        setAssessmentId(null);
        setReportContent(createEmptyReportContent());
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
      setAssessmentId(data.id);

      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('id, assessment_id, goal_text, headline_suggestion, interview_overview')
        .eq('assessment_id', data.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle<ReportRecord>();

      if (reportError) {
        console.error('Error loading report', reportError);
        setError('We could not load your report right now. Please try again.');
        setReportContent(createEmptyReportContent());
        setLoading(false);
        return;
      }

      if (!reportData) {
        setReportContent(createEmptyReportContent());
        setLoading(false);
        return;
      }

      await loadReportContent(reportData);
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
    if (!assessmentId) return new Set<string>();
    return actionProgressByAssessment[assessmentId] ?? new Set<string>();
  }, [actionProgressByAssessment, assessmentId]);

  useEffect(() => {
    if (!assessmentId || !session?.user?.id) return;

    let isCancelled = false;

    const fetchProgress = async () => {
      const supabase = getSupabaseClient();
      const { data, error: fetchError } = await supabase
        .from('action_plan_progress')
        .select('action_id, completed')
        .eq('report_id', assessmentId)
        .eq('user_id', session.user.id);

      if (fetchError) {
        console.error('Error loading action progress', fetchError);
        setProgressError('We could not load your saved progress right now. You can still use the checkboxes.');
        return;
      }

      if (isCancelled || !data) return;

      const completedIds = new Set((data as ActionPlanProgressRecord[]).filter((row) => row.completed).map((row) => row.action_id));

      setActionProgressByAssessment((prev) => ({
        ...prev,
        [assessmentId]: completedIds
      }));
      setProgressError('');
    };

    fetchProgress();

    return () => {
      isCancelled = true;
    };
  }, [assessmentId, session?.user?.id]);

  const toggleAction = async (id: string) => {
    if (!assessmentId || !session?.user?.id) return;

    const isCompleted = completedActions.has(id);
    const nextCompleted = !isCompleted;

    setActionProgressByAssessment((prev) => {
      const existing = prev[assessmentId] ?? new Set<string>();
      const nextSet = new Set(existing);

      if (nextCompleted) {
        nextSet.add(id);
      } else {
        nextSet.delete(id);
      }

      return { ...prev, [assessmentId]: nextSet };
    });
    setProgressError('');

    const supabase = getSupabaseClient();
    const { error: upsertError } = await supabase.from('action_plan_progress').upsert(
      {
        user_id: session.user.id,
        report_id: assessmentId,
        action_id: id,
        completed: nextCompleted,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,report_id,action_id' }
    );

    if (upsertError) {
      console.error('Error saving action progress', upsertError);
      setProgressError('We could not save that change. Please try again.');

      setActionProgressByAssessment((prev) => {
        const existing = prev[assessmentId] ?? new Set<string>();
        const nextSet = new Set(existing);

        if (nextCompleted) {
          nextSet.delete(id);
        } else {
          nextSet.add(id);
        }

        return { ...prev, [assessmentId]: nextSet };
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
    <ReportContext.Provider value={{ assessment, goalText, completedActions, toggleAction, progressError, reportContent }}>
      <div className="space-y-6 text-slate-100">
        <header className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Your personalised report</p>
          <h1 className="text-2xl font-bold text-white">Snapshot of where you are now</h1>
          <p className="text-sm text-slate-300">Latest assessment submitted on your account.</p>
        </header>

        {contentError ? <p className="text-sm text-amber-300">{contentError}</p> : null}

        <Outlet />
      </div>
    </ReportContext.Provider>
  );
}

export default ReportLayout;
