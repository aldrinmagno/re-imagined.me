import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../lib/dateUtils';
import { useReportContext } from '../../components/report/ReportLayout';
import { buildCvHtml, buildCvPlainText } from '../../lib/cvExport';
import { createCvVersion, deleteCvVersion, getCvVersions, updateCvVersion } from '../../lib/cvVersionsApi';
import type { CvVersionContent, CvVersionRecord } from '../../types/cvVersions';

const defaultContent: CvVersionContent = {
  headline: '',
  summary: '',
  top_skills: [],
  bullets: []
};

const createEmptyVersion = (): CvVersionContent => ({
  headline: '',
  summary: '',
  top_skills: [],
  bullets: []
});


const downloadDocx = (fileName: string, content: CvVersionContent) => {
  const html = buildCvHtml(content);
  const blob = new Blob([html], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
  anchor.click();
  URL.revokeObjectURL(url);
};

function CVVersions() {
  const { user } = useAuth();
  const { reportContent } = useReportContext();
  const roleOptions = reportContent.futureRoles;
  const [versions, setVersions] = useState<CvVersionRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftRoleKey, setDraftRoleKey] = useState('general');
  const [draftContent, setDraftContent] = useState<CvVersionContent>(defaultContent);

  const selectedVersion = versions.find((version) => version.id === selectedId) ?? null;

  const roleLabelByKey = useMemo(() => {
    const map = new Map(roleOptions.map((role) => [role.id, role.title]));
    map.set('general', 'General');
    return map;
  }, [roleOptions]);

  useEffect(() => {
    const loadVersions = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getCvVersions(user.id);
        setVersions(data);
        setSelectedId(data[0]?.id ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load CV versions.');
      } finally {
        setLoading(false);
      }
    };

    void loadVersions();
  }, [user]);

  useEffect(() => {
    if (!selectedVersion) return;
    setDraftName(selectedVersion.name);
    setDraftRoleKey(selectedVersion.role_key);
    setDraftContent(selectedVersion.content ?? defaultContent);
  }, [selectedVersion]);

  const handleCreate = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    const roleKey = roleOptions[0]?.id ?? 'general';
    try {
      const created = await createCvVersion(user.id, {
        name: `CV Version ${versions.length + 1}`,
        role_key: roleKey,
        content: createEmptyVersion()
      });
      setVersions((prev) => [created, ...prev]);
      setSelectedId(created.id);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create CV version.');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!user || !selectedVersion) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createCvVersion(user.id, {
        name: `${selectedVersion.name} (copy)`,
        role_key: selectedVersion.role_key,
        content: selectedVersion.content
      });
      setVersions((prev) => [created, ...prev]);
      setSelectedId(created.id);
    } catch (duplicateError) {
      setError(duplicateError instanceof Error ? duplicateError.message : 'Unable to duplicate CV version.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !selectedVersion) return;
    setSaving(true);
    setError(null);
    try {
      await deleteCvVersion(user.id, selectedVersion.id);
      setVersions((prev) => {
        const remaining = prev.filter((version) => version.id !== selectedVersion.id);
        setSelectedId(remaining[0]?.id ?? null);
        return remaining;
      });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete CV version.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (updates: Partial<CvVersionRecord>) => {
    if (!user || !selectedVersion) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateCvVersion(user.id, selectedVersion.id, updates);
      setVersions((prev) => prev.map((version) => (version.id === updated.id ? updated : version)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update CV version.');
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (field: keyof CvVersionContent, value: string | string[]) => {
    setDraftContent((prev) => ({ ...prev, [field]: value }) as CvVersionContent);
  };

  const handleRoleChange = (roleKey: string) => {
    setDraftRoleKey(roleKey);
  };

  const handleRename = (value: string) => {
    setDraftName(value);
  };

  const handleSave = async () => {
    if (!selectedVersion) return;
    await handleUpdate({
      name: draftName.trim() || selectedVersion.name,
      role_key: draftRoleKey,
      content: {
        headline: draftContent.headline,
        summary: draftContent.summary,
        top_skills: draftContent.top_skills.filter((skill) => skill.trim()),
        bullets: draftContent.bullets.filter((bullet) => bullet.trim())
      }
    });
  };

  const handleCopy = async () => {
    if (!selectedVersion) return;
    if (!navigator?.clipboard) return;
    await navigator.clipboard.writeText(buildCvPlainText(draftContent));
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-600">Loading CV versions...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">CV Versioning</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Manage role-specific CV drafts.</h1>
            <p className="mt-2 text-sm text-slate-600">
              Create, duplicate, rename, and export CV versions for each role. Updates save automatically to your account.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              New version
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              disabled={!selectedVersion || saving}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              Duplicate
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!selectedVersion || saving}
              className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              Delete
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your versions</p>
          {versions.length === 0 ? (
            <p className="text-sm text-slate-500">Create your first CV version to get started.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {versions.map((version) => (
                <button
                  key={version.id}
                  type="button"
                  onClick={() => setSelectedId(version.id)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    selectedId === version.id
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-700 hover:border-emerald-200'
                  }`}
                >
                  <p className="font-semibold">{version.name}</p>
                  <p className="text-xs text-slate-500">
                    {roleLabelByKey.get(version.role_key) ?? 'General'} • {formatDateTime(version.updated_at)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {!selectedVersion ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Select or create a CV version to edit.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-slate-700">Version name</span>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(event) => handleRename(event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-slate-700">Role focus</span>
                  <select
                    value={draftRoleKey}
                    onChange={(event) => handleRoleChange(event.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  >
                    {roleOptions.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.title}
                      </option>
                    ))}
                    <option value="general">General</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-700">Headline</span>
                <input
                  type="text"
                  value={draftContent.headline}
                  onChange={(event) => handleContentChange('headline', event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="e.g. Product Leader | Growth & Retention"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-700">Summary</span>
                <textarea
                  value={draftContent.summary}
                  onChange={(event) => handleContentChange('summary', event.target.value)}
                  rows={4}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="Short narrative summary highlighting your focus."
                />
              </label>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Top skills</p>
                    <button
                      type="button"
                      onClick={() =>
                        handleContentChange('top_skills', [...draftContent.top_skills, ''])
                      }
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      + Add skill
                    </button>
                  </div>
                  <div className="space-y-2">
                    {draftContent.top_skills.length === 0 && (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">
                        Add 4–6 top skills to highlight for this role.
                      </div>
                    )}
                    {draftContent.top_skills.map((skill, index) => (
                      <div key={`skill-${index}`} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(event) => {
                            const updated = [...draftContent.top_skills];
                            updated[index] = event.target.value;
                            handleContentChange('top_skills', updated);
                          }}
                          className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = draftContent.top_skills.filter((_, idx) => idx !== index);
                            handleContentChange('top_skills', updated);
                          }}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Impact bullets</p>
                    <button
                      type="button"
                      onClick={() => handleContentChange('bullets', [...draftContent.bullets, ''])}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      + Add bullet
                    </button>
                  </div>
                  <div className="space-y-2">
                    {draftContent.bullets.length === 0 && (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">
                        Add impact bullets tailored to this role.
                      </div>
                    )}
                    {draftContent.bullets.map((bullet, index) => (
                      <div key={`bullet-${index}`} className="flex items-start gap-2">
                        <textarea
                          value={bullet}
                          onChange={(event) => {
                            const updated = [...draftContent.bullets];
                            updated[index] = event.target.value;
                            handleContentChange('bullets', updated);
                          }}
                          rows={2}
                          className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = draftContent.bullets.filter((_, idx) => idx !== index);
                            handleContentChange('bullets', updated);
                          }}
                          className="pt-2 text-xs font-semibold text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {saving ? 'Saving...' : 'Save version'}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                >
                  Copy to clipboard
                </button>
                <button
                  type="button"
                  onClick={() => downloadDocx(`${draftName || selectedVersion.name}`, draftContent)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                >
                  Download .docx
                </button>
                <span className="text-xs text-slate-500">Last updated: {formatDateTime(selectedVersion.updated_at)}</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default CVVersions;
