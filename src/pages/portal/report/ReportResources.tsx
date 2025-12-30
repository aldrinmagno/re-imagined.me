import { useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { LearningResourceCard } from '../../../components/report/ReportCards';
import { useReportContext } from '../../../components/report/ReportLayout';
import { saveResource } from '../../../lib/resourceSavesApi';

function ReportResources() {
  const { user } = useAuth();
  const { reportContent, selectedRoleId } = useReportContext();
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const selectedRole = reportContent.futureRoles.find((role) => role.id === selectedRoleId) || null;
  const filteredResources = selectedRoleId
    ? reportContent.learningResources.filter(
        (resource) => !resource.futureRoleId || resource.futureRoleId === selectedRoleId
      )
    : reportContent.learningResources;

  const aiLiteracyPack = useMemo(() => {
    const roleTitle = selectedRole?.title?.toLowerCase() ?? '';
    const isTechnical = ['engineer', 'developer', 'data', 'analyst', 'scientist', 'architect'].some((keyword) =>
      roleTitle.includes(keyword)
    );
    return {
      id: isTechnical ? 'ai-literacy-tech' : 'ai-literacy-nontech',
      title: 'AI Literacy Pack',
      description: isTechnical
        ? 'Hands-on AI workflow resources for technical roles: prompt evaluation, data privacy, and deployment readiness.'
        : 'Practical AI literacy for non-technical roles: use cases, workflow design, and responsible adoption.',
      link: isTechnical ? 'https://ai.google/education' : 'https://www.ibm.com/skills/topics/artificial-intelligence',
      tags: ['AI literacy', 'always included']
    };
  }, [selectedRole]);

  const allResources = useMemo(
    () => [aiLiteracyPack, ...filteredResources],
    [aiLiteracyPack, filteredResources]
  );

  const handleSave = async () => {
    if (!user) {
      setSaveError('Log in to save resources.');
      return;
    }
    setSaveMessage('');
    setSaveError('');
    try {
      await saveResource(user.id, aiLiteracyPack.id);
      setSaveMessage('Saved to your plan.');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unable to save resource.');
    }
  };

  if (!filteredResources.length) {
    return (
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Learning resources</p>
          <h2 className="text-lg font-semibold text-slate-900">Curated support for your next skills</h2>
          <p className="text-sm text-slate-700">
            {selectedRole
              ? 'No resources are available yet for this role. Try another role or check back soon.'
              : 'Your tailored resources will be loaded here once your report content is ready.'}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-800">
          <p className="font-semibold text-slate-900">{aiLiteracyPack.title}</p>
          <p className="mt-2 text-sm text-slate-700">{aiLiteracyPack.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a href={aiLiteracyPack.link} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Open resource
            </a>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-600"
            >
              Add to plan
            </button>
          </div>
          {saveMessage && <p className="mt-2 text-xs text-emerald-700">{saveMessage}</p>}
          {saveError && <p className="mt-2 text-xs text-rose-700">{saveError}</p>}
        </div>
        <p className="text-sm text-slate-700">No resources available yet.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Learning resources</p>
        <h2 className="text-lg font-semibold text-slate-900">Curated support for your next skills</h2>
        <p className="text-sm text-slate-700">
          Each resource is tied to a specific skill or role so you know exactly how it moves you forward.
        </p>
        <p className="text-sm text-slate-700">
          {selectedRole
            ? `Focusing on: ${selectedRole.title}. Switch roles in Roles & Skills to change these resources.`
            : 'Showing resources across all suggested roles until you pick one to focus.'}
        </p>
      </div>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-800">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-900">{aiLiteracyPack.title}</p>
            <p className="mt-1 text-sm text-slate-700">{aiLiteracyPack.description}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-emerald-700">
              {aiLiteracyPack.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-emerald-200 bg-white px-2 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a href={aiLiteracyPack.link} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Open resource
            </a>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-600"
            >
              Add to plan
            </button>
          </div>
        </div>
        {saveMessage && <p className="mt-2 text-xs text-emerald-700">{saveMessage}</p>}
        {saveError && <p className="mt-2 text-xs text-rose-700">{saveError}</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {allResources.slice(1).map((resource) => (
          <LearningResourceCard key={resource.title} {...resource} />
        ))}
      </div>
    </section>
  );
}

export default ReportResources;
