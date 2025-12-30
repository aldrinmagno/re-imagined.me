import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSupabaseClient } from '../../lib/supabaseClient';
import { validateImpactInventoryEntry } from '../../lib/impactInventoryValidation';
import type { ImpactInventoryDraft, ImpactInventoryEntry, ImpactInventoryRecord } from '../../types/impactInventory';

const STORAGE_KEY = 'impactInventoryDraft';

const createEmptyEntry = (): ImpactInventoryEntry => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `entry-${Date.now()}`,
  title: '',
  company: '',
  dateRange: '',
  context: '',
  actions: '',
  outcomes: '',
  metrics: '',
  tools: '',
  collaborators: '',
  skillsUsed: ''
});

const parseDraft = (): ImpactInventoryDraft | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ImpactInventoryDraft;
  } catch {
    return null;
  }
};

const formatTimestamp = (value?: string | null) => {
  if (!value) return 'Not saved yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not saved yet';
  return date.toLocaleString();
};

function ImpactInventory() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ImpactInventoryEntry[]>([]);
  const [includeInReport, setIncludeInReport] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  const validationIssues = useMemo(() => {
    return entries.reduce<Record<string, ReturnType<typeof validateImpactInventoryEntry>>>((acc, entry) => {
      acc[entry.id] = validateImpactInventoryEntry(entry);
      return acc;
    }, {});
  }, [entries]);

  const loadInventory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const supabase = getSupabaseClient();
    const { data, error: fetchError } = await supabase
      .from('impact_inventory')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle<ImpactInventoryRecord>();

    if (fetchError) {
      setError(fetchError.message);
    }

    const draft = parseDraft();
    const dbUpdatedAt = data?.updated_at ?? null;
    const draftUpdatedAt = draft?.updatedAt ?? null;

    const shouldUseDraft =
      draftUpdatedAt &&
      (!dbUpdatedAt || new Date(draftUpdatedAt).getTime() > new Date(dbUpdatedAt).getTime());

    if (shouldUseDraft && draft) {
      setEntries(draft.entries);
      setIncludeInReport(draft.includeInReport);
      setLastSavedAt(dbUpdatedAt);
    } else if (data) {
      setEntries(data.entries ?? []);
      setIncludeInReport(data.include_in_report);
      setLastSavedAt(data.updated_at);
    } else {
      setEntries([createEmptyEntry()]);
      setIncludeInReport(true);
      setLastSavedAt(null);
    }

    setLoading(false);
    setHasHydrated(true);
  }, [user]);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    if (!hasHydrated) return;
    const draft: ImpactInventoryDraft = {
      entries,
      includeInReport,
      updatedAt: new Date().toISOString()
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [entries, includeInReport, hasHydrated]);

  const updateEntry = (id: string, field: keyof ImpactInventoryEntry, value: string) => {
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)));
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, createEmptyEntry()]);
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const moveEntry = (index: number, direction: -1 | 1) => {
    setEntries((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    const supabase = getSupabaseClient();
    const payload = {
      user_id: user.id,
      entries,
      include_in_report: includeInReport
    };

    const { data, error: saveError } = await supabase
      .from('impact_inventory')
      .upsert(payload, { onConflict: 'user_id' })
      .select('updated_at')
      .single<{ updated_at: string }>();

    if (saveError) {
      setError(saveError.message);
    } else {
      setLastSavedAt(data.updated_at);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-600">Loading your impact inventory...</p>
      </div>
    );
  }

  const hasEntries = entries.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Impact Inventory Builder</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Capture your strongest impact stories.</h1>
            <p className="mt-2 text-sm text-slate-600">
              Add wins, outcomes, and measurable proof points. Drafts save automatically in this browser; click save to
              sync with your account.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={addEntry}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
            >
              Add entry
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !user}
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {saving ? 'Saving...' : 'Save to account'}
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeInReport}
              onChange={(event) => setIncludeInReport(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
            />
            Include this inventory in your report drafts
          </label>
          <span>Last saved: {formatTimestamp(lastSavedAt)}</span>
        </div>
        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </header>

      {!hasEntries && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No entries yet. Add your first impact story to start building the inventory.
        </div>
      )}

      <div className="flex flex-col gap-6">
        {entries.map((entry, index) => {
          const issues = validationIssues[entry.id] ?? {};
          const issueList = Object.values(issues).filter(Boolean) as string[];

          return (
            <section
              key={entry.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-200"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Impact Entry {index + 1}</p>
                    <p className="text-lg font-semibold text-slate-900">{entry.title || 'Untitled impact story'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveEntry(index, -1)}
                      disabled={index === 0}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600 disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveEntry(index, 1)}
                      disabled={index === entries.length - 1}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600 disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                      Move down
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEntry(entry.id)}
                      className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-700">Title</span>
                    <input
                      type="text"
                      value={entry.title}
                      onChange={(event) => updateEntry(entry.id, 'title', event.target.value)}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      placeholder="Launch growth experiment, streamline onboarding, etc."
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-700">Company</span>
                    <input
                      type="text"
                      value={entry.company}
                      onChange={(event) => updateEntry(entry.id, 'company', event.target.value)}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      placeholder="Organization name"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-700">Date range</span>
                    <input
                      type="text"
                      value={entry.dateRange}
                      onChange={(event) => updateEntry(entry.id, 'dateRange', event.target.value)}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      placeholder="e.g. Jan 2022 – Jun 2023"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-700">Tools</span>
                    <input
                      type="text"
                      value={entry.tools}
                      onChange={(event) => updateEntry(entry.id, 'tools', event.target.value)}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      placeholder="Tools, platforms, or frameworks"
                    />
                  </label>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-700">Context</span>
                    <textarea
                      value={entry.context}
                      onChange={(event) => updateEntry(entry.id, 'context', event.target.value)}
                      rows={3}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      placeholder="What was happening? Why did this work matter?"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-700">Actions</span>
                    <textarea
                      value={entry.actions}
                      onChange={(event) => updateEntry(entry.id, 'actions', event.target.value)}
                      rows={3}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      placeholder="What did you do? Focus on leadership, collaboration, and execution."
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-700">Outcomes</span>
                    <textarea
                      value={entry.outcomes}
                      onChange={(event) => updateEntry(entry.id, 'outcomes', event.target.value)}
                      rows={3}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      placeholder="What changed? What did your work unlock?"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-700">Metrics</span>
                    <textarea
                      value={entry.metrics}
                      onChange={(event) => updateEntry(entry.id, 'metrics', event.target.value)}
                      rows={3}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      placeholder="Quantify results: %, $, time saved, NPS, etc."
                    />
                  </label>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-700">Collaborators</span>
                    <input
                      type="text"
                      value={entry.collaborators}
                      onChange={(event) => updateEntry(entry.id, 'collaborators', event.target.value)}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      placeholder="Teams, stakeholders, partners"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-700">Skills used</span>
                    <input
                      type="text"
                      value={entry.skillsUsed}
                      onChange={(event) => updateEntry(entry.id, 'skillsUsed', event.target.value)}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      placeholder="Strategic planning, stakeholder management, analytics"
                    />
                  </label>
                </div>

                {issueList.length > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                    <p className="font-semibold">Add a few more details before sharing this entry:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {issueList.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default ImpactInventory;
