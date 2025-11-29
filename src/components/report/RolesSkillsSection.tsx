import type { FutureRole, RoleSkillGroup } from '../../types/report';
import { useReportContext } from './ReportLayout';

export type CombinedRole = FutureRole & { skills: string[]; skillSummary?: string | null };

const RoleWithSkillsCard = ({ title, description, reasons, skills, skillSummary, onSelect, isSelected }: CombinedRole & {
  onSelect?: () => void;
  isSelected?: boolean;
}) => (
  <article
    className={`flex h-full flex-col gap-4 rounded-xl border bg-slate-900/70 p-4 shadow-sm transition ${
      isSelected ? 'border-emerald-400/80 bg-emerald-500/5' : 'border-slate-800'
    }`}
  >
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">Future role</p>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {(skillSummary || description) && <p className="text-sm text-slate-300">{skillSummary || description}</p>}
    </div>

    {reasons.length > 0 && (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Why it fits</p>
        <ul className="space-y-2 text-sm text-slate-200">
          {reasons.map((reason) => (
            <li key={reason} className="flex gap-2">
              <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-300" aria-hidden />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {skills.length > 0 && (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Skills to build next</p>
        <ul className="space-y-2 text-sm text-slate-200">
          {skills.map((skill) => (
            <li key={skill} className="flex gap-2 rounded-lg border border-slate-800/70 bg-slate-900/80 px-3 py-2">
              <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-300" aria-hidden />
              <span>{skill}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {onSelect ? (
      <button
        type="button"
        onClick={onSelect}
        className={`mt-auto inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition ${
          isSelected
            ? 'border-emerald-300 bg-emerald-400/10 text-emerald-50'
            : 'border-slate-700 bg-slate-800 text-emerald-200 hover:border-emerald-300 hover:text-emerald-100'
        }`}
        aria-pressed={isSelected}
      >
        {isSelected ? 'Selected — viewing this plan' : 'Focus on this role'}
      </button>
    ) : null}
  </article>
);

const buildCombinedRoles = (futureRoles: FutureRole[], roleSkillGroups: RoleSkillGroup[]): CombinedRole[] => {
  const skillsByRoleId = new Map<string, RoleSkillGroup>();
  const skillsByRoleName = new Map<string, RoleSkillGroup>();

  roleSkillGroups.forEach((group) => {
    if (group.roleId) {
      skillsByRoleId.set(group.roleId, group);
    }

    skillsByRoleName.set(group.role.toLowerCase(), group);
  });

  const seenGroups = new Set<RoleSkillGroup>();

  const combined = futureRoles.map((role) => {
    const matchedSkills = skillsByRoleId.get(role.id) || skillsByRoleName.get(role.title.toLowerCase());

    if (matchedSkills) {
      seenGroups.add(matchedSkills);
    }

    return {
      ...role,
      skills: matchedSkills?.skills || [],
      skillSummary: matchedSkills?.summary ?? role.description
    };
  });

  const unmatchedGroups = roleSkillGroups.filter((group) => !seenGroups.has(group));

  const unmatchedCards: CombinedRole[] = unmatchedGroups.map((group) => ({
    id: group.roleId || group.role,
    title: group.role,
    description: group.summary,
    reasons: [],
    skills: group.skills,
    skillSummary: group.summary
  }));

  return [...combined, ...unmatchedCards];
};

interface RolesSkillsSectionProps {
  className?: string;
}

function RolesSkillsSection({ className = '' }: RolesSkillsSectionProps) {
  const { reportContent, selectedRoleId, setSelectedRoleId } = useReportContext();
  const combinedRoles = buildCombinedRoles(reportContent.futureRoles, reportContent.roleSkillGroups);

  if (!combinedRoles.length) {
    return (
      <section className={`space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 ${className}`}>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Future roles & skills</p>
          <h2 className="text-lg font-semibold text-white">Roles to explore based on your strengths</h2>
          <p className="text-sm text-slate-300">Your personalised matches are being prepared. Please check back shortly.</p>
        </div>
        <p className="text-sm text-slate-300">No role or skill suggestions are available yet.</p>
      </section>
    );
  }

  return (
    <section className={`space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 ${className}`}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Future roles & skills</p>
          <h2 className="text-lg font-semibold text-white">Roles to explore with the skills to grow into them</h2>
          <p className="text-sm text-slate-300">
            Each card pairs a suggested role with the most useful skills to practice next, so you can move forward with confiden
ce.
          </p>
        </div>
        <p className="text-sm text-slate-300">
          {selectedRoleId
            ? 'You are focusing your plan and resources on one role. Tap another card to switch, or tap again to clear.'
            : 'Select one role to focus your 90-day plan and resources on it.'}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {combinedRoles.map((role) => (
          <RoleWithSkillsCard
            key={role.id}
            {...role}
            isSelected={selectedRoleId === role.id}
            onSelect={() => setSelectedRoleId(selectedRoleId === role.id ? null : role.id)}
          />
        ))}
      </div>
    </section>
  );
}

export default RolesSkillsSection;
