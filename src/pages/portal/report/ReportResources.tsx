import { LearningResourceCard } from '../../../components/report/ReportCards';
import { learningResources } from '../../../data/reportContent';

function ReportResources() {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Learning resources</p>
        <h2 className="text-lg font-semibold text-white">Curated support for your next skills</h2>
        <p className="text-sm text-slate-300">
          Each resource is tied to a specific skill or role so you know exactly how it moves you forward.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {learningResources.map((resource) => (
          <LearningResourceCard key={resource.title} {...resource} />
        ))}
      </div>
    </section>
  );
}

export default ReportResources;
