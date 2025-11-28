import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
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

export const reportSectionLinks = [
  { to: 'overview', label: 'Overview' },
  { to: 'roles', label: 'Roles' },
  { to: 'skills', label: 'Skills' },
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

      const completedIds = new Set((data as ActionPlanProgressRecord[]).filter((row) => row.completed).map((row) => row.action_id));

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
    <ReportContext.Provider value={{ assessment, goalText, completedActions, toggleAction, progressError }}>
      <div className="space-y-6 text-slate-100">
        <header className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Your personalised report</p>
          <h1 className="text-2xl font-bold text-white">Snapshot of where you are now</h1>
          <p className="text-sm text-slate-300">Latest assessment submitted on your account.</p>
        </header>

        <Outlet />
      </div>
    </ReportContext.Provider>
  );
}

export default ReportLayout;
