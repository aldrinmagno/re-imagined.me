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

function Report() {
  const { session } = useAuth();
  const [assessment, setAssessment] = useState<AssessmentFormData | null>(null);
  const [snapshotInsights, setSnapshotInsights] = useState<SnapshotInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

      <div className="grid gap-6 lg:grid-cols-[2fr,1.4fr]">
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

        <AssessmentPreviewPanel
          formData={assessment}
          goalText={goalText}
          industryLabel={assessment.industry.join(', ')}
          mode="live"
          snapshotInsights={snapshotInsights}
        />
      </div>

      <section className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Future roles you could grow into</p>
          <p className="text-base font-semibold text-white">Personalized matches coming soon</p>
          <p className="text-sm text-slate-300">We will surface 3–5 emerging roles based on your answers and strengths.</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Skills to build next</p>
          <p className="text-base font-semibold text-white">Tailored skill map on the way</p>
          <p className="text-sm text-slate-300">Skills, resources, and lightweight practice projects will appear here.</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">90-day action plan</p>
          <p className="text-base font-semibold text-white">Checklists and milestones coming soon</p>
          <p className="text-sm text-slate-300">You will see a sequenced, trackable plan with clear done states.</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Interview support</p>
          <p className="text-base font-semibold text-white">Talking points and headlines pending</p>
          <p className="text-sm text-slate-300">We will add interview talking points and a LinkedIn headline suggestion.</p>
        </div>
      </section>
    </div>
  );
}

export default Report;
