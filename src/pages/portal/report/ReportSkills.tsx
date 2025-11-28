import { RoleSkillsCard } from '../../../components/report/ReportCards';
import { roleSkillGroups } from '../../../data/reportContent';

function ReportSkills() {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Skills to build next</p>
        <h2 className="text-lg font-semibold text-white">Focused skill paths by role</h2>
        <p className="text-sm text-slate-300">
          Each role highlights specific, practice-ready skills so you know exactly what to work on first.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roleSkillGroups.map((roleSkills) => (
          <RoleSkillsCard key={roleSkills.role} {...roleSkills} />
        ))}
      </div>
    </section>
  );
}

export default ReportSkills;
