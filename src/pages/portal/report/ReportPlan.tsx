import { useReportContext } from '../../../components/report/ReportLayout';

function ReportPlan() {
  const { completedActions, toggleAction, progressError, reportContent } = useReportContext();

  if (!reportContent.actionPlanPhases.length) {
    return (
      <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">90-day action plan</p>
          <h2 className="text-lg font-semibold text-white">A calm, paced plan across three months</h2>
          <p className="text-sm text-slate-300">Your personalised plan will appear here once your report has been generated.</p>
          {progressError ? <p className="text-sm text-amber-300">{progressError}</p> : null}
        </div>
        <p className="text-sm text-slate-300">No plan items available yet.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">90-day action plan</p>
        <h2 className="text-lg font-semibold text-white">A calm, paced plan across three months</h2>
        <p className="text-sm text-slate-300">
          Use the checkboxes to mark progress. Each action includes a light weekly time signal so you can fit it in alongside
          work and life.
        </p>
        {progressError ? <p className="text-sm text-amber-300">{progressError}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-1">
        {reportContent.actionPlanPhases.map((phase) => (
          <article
            key={phase.id}
            className="flex flex-col gap-3 rounded-xl shadow-sm"
          >
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-300">{phase.title}</p>
              <p className="text-sm text-slate-200">{phase.description || 'More details coming soon.'}</p>
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
                        isCompleted ? 'border-emerald-400/70 bg-emerald-500/10 text-emerald-50' : 'border-slate-800/70 bg-slate-900/80 text-slate-100'
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
                          isCompleted ? 'border-emerald-300 bg-emerald-400 text-slate-900' : 'border-slate-600 bg-slate-800 text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium leading-snug">{item.title}</span>
                        <span className="text-xs text-slate-300">
                          {item.estimate ? `${item.estimate} to keep moving` : 'Time estimate coming soon.'}
                        </span>
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
  );
}

export default ReportPlan;
