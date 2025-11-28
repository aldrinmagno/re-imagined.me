import type { FutureRole, RoleSkill, LearningResource } from '../../data/reportContent';

export const FutureRoleCard = ({ title, reasons }: FutureRole) => (
  <article className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Future role</p>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
    </div>
    <ul className="space-y-2 text-sm text-slate-200">
      {reasons.map((reason) => (
        <li key={reason} className="flex gap-2">
          <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-300" aria-hidden />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  </article>
);

export const RoleSkillsCard = ({ role, summary, skills }: RoleSkill) => (
  <article className="flex h-full flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Skills to build</p>
      <h3 className="text-base font-semibold text-white">{role}</h3>
      <p className="text-sm text-slate-300">{summary}</p>
    </div>
    <ul className="space-y-2 text-sm text-slate-200">
      {skills.map((skill) => (
        <li key={skill} className="flex gap-2 rounded-lg border border-slate-800/70 bg-slate-900/80 px-3 py-2">
          <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-300" aria-hidden />
          <span>{skill}</span>
        </li>
      ))}
    </ul>
  </article>
);

export const LearningResourceCard = ({ title, description, link, supports }: LearningResource) => (
  <article className="flex h-full flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
    <div className="space-y-1">
      <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
        Resource
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200">{supports}</span>
      </p>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-300">{description}</p>
    </div>
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
    >
      Open resource
      <span aria-hidden>↗</span>
    </a>
  </article>
);
