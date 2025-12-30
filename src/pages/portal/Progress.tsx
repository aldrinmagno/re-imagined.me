import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getJobSearchEvents } from '../../lib/jobSearchEventsApi';
import type { JobSearchEventRecord, JobSearchEventType } from '../../types/jobSearchEvents';

const eventLabels: Record<JobSearchEventType, string> = {
  apply: 'Applications sent',
  interview: 'Interviews',
  offer: 'Offers',
  reject: 'Rejections',
  followup: 'Follow-ups done',
  outreach: 'Networking outreaches'
};

const getAverageResponseDays = (events: JobSearchEventRecord[]) => {
  const applyEvents = events.filter((event) => event.type === 'apply');
  const interviewEvents = events.filter((event) => event.type === 'interview');
  if (applyEvents.length === 0 || interviewEvents.length === 0) return null;

  const responseTimes: number[] = [];
  interviewEvents.forEach((interviewEvent) => {
    const applicationId = interviewEvent.payload?.application_id as string | undefined;
    const appliedEvent = applyEvents.find((event) => event.payload?.application_id === applicationId);
    if (!appliedEvent) return;
    const appliedDate = new Date(appliedEvent.created_at);
    const interviewDate = new Date(interviewEvent.created_at);
    const diffDays = Math.round((interviewDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
    responseTimes.push(diffDays);
  });

  if (responseTimes.length === 0) return null;
  const total = responseTimes.reduce((sum, value) => sum + value, 0);
  return Math.max(0, Math.round(total / responseTimes.length));
};

const suggestionCards = [
  {
    id: 'ask-feedback',
    title: 'Ask for feedback',
    body: 'Send a short note asking for feedback to refine future applications.'
  },
  {
    id: 'refresh-cv',
    title: 'Refresh your CV version',
    body: 'Adjust your CV bullets and headline to reflect recent outcomes.'
  },
  {
    id: 'networking',
    title: 'Activate your network',
    body: 'Reach out to 2–3 contacts for insight or referrals.'
  }
];

function Progress() {
  const { user } = useAuth();
  const [events, setEvents] = useState<JobSearchEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getJobSearchEvents(user.id);
        setEvents(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load progress data.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user]);

  const metrics = useMemo(() => {
    const counts = events.reduce<Record<JobSearchEventType, number>>(
      (acc, event) => {
        acc[event.type] += 1;
        return acc;
      },
      {
        apply: 0,
        interview: 0,
        offer: 0,
        reject: 0,
        followup: 0,
        outreach: 0
      }
    );

    const interviewRate = counts.apply > 0 ? Math.round((counts.interview / counts.apply) * 100) : 0;
    const responseTime = getAverageResponseDays(events);

    return {
      counts,
      interviewRate,
      responseTime
    };
  }, [events]);

  const rejectedEvents = events.filter((event) => event.type === 'reject');

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-600">Loading progress dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Progress dashboard</p>
          <h1 className="text-2xl font-semibold text-slate-900">Track your job-search momentum.</h1>
          <p className="text-sm text-slate-600">Monitor core metrics and see next-step suggestions after rejections.</p>
        </div>
        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {Object.entries(metrics.counts).map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{eventLabels[key as JobSearchEventType]}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Interview rate</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{metrics.interviewRate}%</p>
          <p className="mt-2 text-sm text-slate-600">Share of applications that reached an interview.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Avg. response time</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {metrics.responseTime !== null ? `${metrics.responseTime} days` : '—'}
          </p>
          <p className="mt-2 text-sm text-slate-600">Average days between apply and interview.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Funnel summary</p>
          <p className="text-sm text-slate-700">
            Applied → Interviews → Offers
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Applied</p>
            <p className="text-lg font-semibold text-slate-900">{metrics.counts.apply}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Interviews</p>
            <p className="text-lg font-semibold text-slate-900">{metrics.counts.interview}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Offers</p>
            <p className="text-lg font-semibold text-slate-900">{metrics.counts.offer}</p>
          </div>
        </div>
      </section>

      {rejectedEvents.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Next move after rejection</p>
            <h2 className="text-lg font-semibold text-amber-900">Reset and re-engage with one small action.</h2>
            <p className="text-sm text-amber-800">
              You have {rejectedEvents.length} recorded rejection{rejectedEvents.length > 1 ? 's' : ''}. Choose a next move:
            </p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {suggestionCards.map((card) => (
              <div key={card.id} className="rounded-xl border border-amber-200 bg-white p-4">
                <p className="text-sm font-semibold text-amber-900">{card.title}</p>
                <p className="mt-2 text-sm text-slate-700">{card.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Progress;
