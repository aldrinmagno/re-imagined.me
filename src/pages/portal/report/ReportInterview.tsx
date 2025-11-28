import {
  interviewPitches,
  interviewTalkingPoints,
  sampleHeadlineSuggestion
} from '../../../data/reportContent';

function ReportInterview() {
  return (
    <div className="space-y-6">
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
            A sample headline crafted for this profile. Swap in your own role, target focus, or proof points when you update it
            later.
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

export default ReportInterview;
