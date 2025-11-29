import { LearningResourceCard } from '../../../components/report/ReportCards';
import { useReportContext } from '../../../components/report/ReportLayout';

function ReportResources() {
  const { reportContent, selectedRoleId } = useReportContext();

  const selectedRole = reportContent.futureRoles.find((role) => role.id === selectedRoleId) || null;
  const filteredResources = selectedRoleId
    ? reportContent.learningResources.filter(
        (resource) => !resource.futureRoleId || resource.futureRoleId === selectedRoleId
      )
    : reportContent.learningResources;

  if (!filteredResources.length) {
    return (
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Learning resources</p>
          <h2 className="text-lg font-semibold text-white">Curated support for your next skills</h2>
          <p className="text-sm text-slate-300">
            {selectedRole
              ? 'No resources are available yet for this role. Try another role or check back soon.'
              : 'Your tailored resources will be loaded here once your report content is ready.'}
          </p>
        </div>
        <p className="text-sm text-slate-300">No resources available yet.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Learning resources</p>
        <h2 className="text-lg font-semibold text-white">Curated support for your next skills</h2>
        <p className="text-sm text-slate-300">
          Each resource is tied to a specific skill or role so you know exactly how it moves you forward.
        </p>
        <p className="text-sm text-slate-300">
          {selectedRole
            ? `Focusing on: ${selectedRole.title}. Switch roles in the overview to change these resources.`
            : 'Showing resources across all suggested roles until you pick one to focus.'}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredResources.map((resource) => (
          <LearningResourceCard key={resource.title} {...resource} />
        ))}
      </div>
    </section>
  );
}

export default ReportResources;
