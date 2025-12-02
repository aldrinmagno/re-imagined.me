import { useReportContext } from '../../../components/report/ReportLayout';

function ReportInterview() {
  const { reportContent } = useReportContext();
  const interview = reportContent.interview;

  if (!interview) {
    return (
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Interview support</p>
          <h2 className="text-lg font-semibold text-slate-900">How to describe yourself in interviews</h2>
          <p className="text-sm text-slate-700">Interview guidance will show up once your report content is ready.</p>
        </div>
        <p className="text-sm text-slate-700">No interview guidance available yet.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Interview support</p>
          <h2 className="text-lg font-semibold text-slate-900">How to describe yourself in interviews</h2>
          <p className="text-sm text-slate-700">
            Use these talking points as a calm, confident way to frame your experience and direction.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-slate-800">
          {interview.pitches.map((pitch) => (
            <li key={pitch} className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" aria-hidden />
              <span className="leading-snug">{pitch}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-2">
          <h3 className="text-base font-semibold text-slate-900">Talking points for interviews</h3>
          <p className="text-sm text-slate-700">
            Keep these in your back pocket to connect your past work to where you&apos;re headed next.
          </p>
          <ul className="space-y-2 text-sm text-slate-800">
            {interview.talkingPoints.map((point) => (
              <li key={point} className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" aria-hidden />
                <span className="leading-snug">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">LinkedIn headline suggestion</p>
          <h2 className="text-lg font-semibold text-slate-900">Use this as a starting point</h2>
          <p className="text-sm text-slate-700">
            A sample headline crafted for this profile. Swap in your own role, target focus, or proof points when you update it later.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-800">
          <p className="font-semibold text-slate-900">{interview.headline || 'Personalized headline coming soon.'}</p>
          <p className="mt-2 text-xs text-emerald-800">Loaded from your saved report data.</p>
        </div>
      </section>
    </div>
  );
}

export default ReportInterview;
