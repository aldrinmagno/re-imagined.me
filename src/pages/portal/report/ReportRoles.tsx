import { FutureRoleCard } from '../../../components/report/ReportCards';
import { useReportContext } from '../../../components/report/ReportLayout';

function ReportRoles() {
  const { reportContent } = useReportContext();

  if (!reportContent.futureRoles.length) {
    return (
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Future roles you could grow into</p>
          <h2 className="text-lg font-semibold text-white">Roles to explore based on your strengths</h2>
          <p className="text-sm text-slate-300">Your personalised roles are being prepared. Please check back shortly.</p>
        </div>
        <p className="text-sm text-slate-300">No role suggestions are available yet.</p>
      </section>
    );
  }

  return (
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
        {reportContent.futureRoles.map((role) => (
          <FutureRoleCard key={role.title} {...role} />
        ))}
      </div>
    </section>
  );
}

export default ReportRoles;
