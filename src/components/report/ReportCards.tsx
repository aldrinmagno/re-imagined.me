import type { FutureRole, RoleSkillGroup, LearningResource } from '../../types/report';

export const FutureRoleCard = ({ title, reasons }: FutureRole) => (
  <article className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Future role</p>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      </div>
    </div>
    <ul className="space-y-2 text-sm text-slate-700">
      {reasons.map((reason) => (
        <li key={reason} className="flex gap-2">
          <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" aria-hidden />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  </article>
);

export const RoleSkillsCard = ({ role, summary, skills }: RoleSkillGroup) => (
  <article className="flex h-full flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Skills to build</p>
      <h3 className="text-base font-semibold text-slate-900">{role}</h3>
      <p className="text-sm text-slate-700">{summary}</p>
    </div>
    <ul className="space-y-2 text-sm text-slate-800">
      {skills.map((skill) => (
        <li key={skill} className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" aria-hidden />
          <span>{skill}</span>
        </li>
      ))}
    </ul>
  </article>
);

export const LearningResourceCard = ({ title, description, link, supports }: LearningResource) => {
  const supportLabel = supports || 'General';

  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-1">
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
          Resource
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800">{supportLabel}</span>
        </p>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-700">{description || 'Details coming soon.'}</p>
      </div>
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-600"
      >
        Open resource
        <span aria-hidden>↗</span>
      </a>
    </article>
  );
};
