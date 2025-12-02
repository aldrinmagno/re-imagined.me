import { RoleSkillsCard } from '../../../components/report/ReportCards';
import { useReportContext } from '../../../components/report/ReportLayout';

function ReportSkills() {
  const { reportContent } = useReportContext();

  if (!reportContent.roleSkillGroups.length) {
    return (
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Skills to build next</p>
          <h2 className="text-lg font-semibold text-slate-900">Focused skill paths by role</h2>
          <p className="text-sm text-slate-700">Personalized skill recommendations will appear here once your report is ready.</p>
        </div>
        <p className="text-sm text-slate-700">No skills to show yet.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Skills to build next</p>
        <h2 className="text-lg font-semibold text-slate-900">Focused skill paths by role</h2>
        <p className="text-sm text-slate-700">
          Each role highlights specific, practice-ready skills so you know exactly what to work on first.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportContent.roleSkillGroups.map((roleSkills) => (
          <RoleSkillsCard key={roleSkills.role} {...roleSkills} />
        ))}
      </div>
    </section>
  );
}

export default ReportSkills;
