import { useReportContext } from '../../components/report/ReportLayout';

function Profile() {
  const { assessment, goalText } = useReportContext();

  return (
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
  );
}

export default Profile;
