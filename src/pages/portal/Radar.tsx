import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../lib/dateUtils';
import { createRadarItem, deleteRadarItem, getRadarItems, updateRadarItem } from '../../lib/radarApi';
import { filterRadarItems } from '../../lib/radarUtils';
import type { RadarItemRecord, RadarItemStatus, RadarItemType } from '../../types/radar';

const tabs: { label: string; type: RadarItemType }[] = [
  { label: 'Companies', type: 'company' },
  { label: 'Recruiters', type: 'recruiter' },
  { label: 'Institutions', type: 'institution' }
];

const emptyMeta = { fit_notes: '', tags: [] as string[] };

const buildBlankItem = (type: RadarItemType): Omit<RadarItemRecord, 'id' | 'user_id' | 'updated_at'> => ({
  type,
  name: '',
  link: '',
  priority: 2,
  status: 'watching',
  meta: emptyMeta
});


const parseTags = (value: string) =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

function Radar() {
  const { user } = useAuth();
  const [items, setItems] = useState<RadarItemRecord[]>([]);
  const [activeType, setActiveType] = useState<RadarItemType>('company');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RadarItemStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [formState, setFormState] = useState(buildBlankItem('company'));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingState, setEditingState] = useState(buildBlankItem('company'));

  const filteredItems = useMemo(
    () =>
      filterRadarItems(items, {
        query: search,
        status: statusFilter,
        priority: priorityFilter,
        type: activeType
      }),
    [items, search, statusFilter, priorityFilter, activeType]
  );

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRadarItems(user.id);
        setItems(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load radar items.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user]);

  useEffect(() => {
    setFormState((prev) => ({ ...prev, type: activeType }));
    setEditingState((prev) => ({ ...prev, type: activeType }));
  }, [activeType]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!formState.name.trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createRadarItem(user.id, formState);
      setItems((prev) => [created, ...prev]);
      setFormState(buildBlankItem(activeType));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save radar item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await deleteRadarItem(user.id, id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete radar item.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (item: RadarItemRecord) => {
    setEditingId(item.id);
    setEditingState({
      type: item.type,
      name: item.name,
      link: item.link ?? '',
      priority: item.priority,
      status: item.status,
      meta: { fit_notes: item.meta.fit_notes ?? '', tags: item.meta.tags ?? [] }
    });
  };

  const handleUpdate = async () => {
    if (!user || !editingId) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateRadarItem(user.id, editingId, editingState);
      setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setEditingId(null);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update radar item.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-600">Loading radar items...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Radar List</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Track companies, recruiters, and institutions.</h1>
            <p className="mt-2 text-sm text-slate-600">
              Keep a live list of targets, add fit notes, and stay on top of priorities across your search.
            </p>
          </div>
        </div>
        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            type="button"
            onClick={() => setActiveType(tab.type)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeType === tab.type
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-emerald-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Add a new entry</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Name</span>
            <input
              type="text"
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Link</span>
            <input
              type="text"
              value={formState.link}
              onChange={(event) => setFormState((prev) => ({ ...prev, link: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="https://..."
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Priority</span>
            <select
              value={formState.priority}
              onChange={(event) => setFormState((prev) => ({ ...prev, priority: Number(event.target.value) as 1 | 2 | 3 }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              <option value={1}>1 - High</option>
              <option value={2}>2 - Medium</option>
              <option value={3}>3 - Low</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm lg:col-span-2">
            <span className="font-medium text-slate-700">Fit notes</span>
            <textarea
              value={formState.meta.fit_notes}
              onChange={(event) => setFormState((prev) => ({ ...prev, meta: { ...prev.meta, fit_notes: event.target.value } }))}
              rows={3}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Status</span>
            <select
              value={formState.status}
              onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value as RadarItemStatus }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              <option value="watching">Watching</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Tags</span>
            <input
              type="text"
              value={formState.meta.tags.join(', ')}
              onChange={(event) => setFormState((prev) => ({ ...prev, meta: { ...prev.meta, tags: parseTags(event.target.value) } }))}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="remote, fintech, referral"
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? 'Saving...' : 'Add to radar'}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <label className="flex flex-1 flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Search</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Search by name, tag, or note"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Priority</span>
              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value === 'all' ? 'all' : (Number(event.target.value) as 1 | 2 | 3))}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">All</option>
                <option value={1}>High</option>
                <option value={2}>Medium</option>
                <option value={3}>Low</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'all' | RadarItemStatus)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">All</option>
                <option value="watching">Watching</option>
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filteredItems.length === 0 ? (
            <p className="text-sm text-slate-500">No items yet for this tab. Add your first target above.</p>
          ) : (
            filteredItems.map((item) => {
              const isEditing = editingId === item.id;
              return (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        Priority {item.priority} • {item.status} • Updated {formatDateTime(item.updated_at)}
                      </p>
                      {item.link && (
                        <a href={item.link} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                          {item.link}
                        </a>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-slate-600">
                    <p>{item.meta.fit_notes}</p>
                    {item.meta.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.meta.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="mt-4 grid gap-3 lg:grid-cols-3">
                      <label className="flex flex-col gap-2 text-sm">
                        <span className="font-medium text-slate-700">Name</span>
                        <input
                          type="text"
                          value={editingState.name}
                          onChange={(event) => setEditingState((prev) => ({ ...prev, name: event.target.value }))}
                          className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm">
                        <span className="font-medium text-slate-700">Link</span>
                        <input
                          type="text"
                          value={editingState.link}
                          onChange={(event) => setEditingState((prev) => ({ ...prev, link: event.target.value }))}
                          className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm">
                        <span className="font-medium text-slate-700">Priority</span>
                        <select
                          value={editingState.priority}
                          onChange={(event) =>
                            setEditingState((prev) => ({ ...prev, priority: Number(event.target.value) as 1 | 2 | 3 }))
                          }
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                        >
                          <option value={1}>High</option>
                          <option value={2}>Medium</option>
                          <option value={3}>Low</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-2 text-sm lg:col-span-2">
                        <span className="font-medium text-slate-700">Fit notes</span>
                        <textarea
                          value={editingState.meta.fit_notes}
                          onChange={(event) =>
                            setEditingState((prev) => ({
                              ...prev,
                              meta: { ...prev.meta, fit_notes: event.target.value }
                            }))
                          }
                          rows={2}
                          className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm">
                        <span className="font-medium text-slate-700">Status</span>
                        <select
                          value={editingState.status}
                          onChange={(event) =>
                            setEditingState((prev) => ({ ...prev, status: event.target.value as RadarItemStatus }))
                          }
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                        >
                          <option value="watching">Watching</option>
                          <option value="applied">Applied</option>
                          <option value="interviewing">Interviewing</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-2 text-sm">
                        <span className="font-medium text-slate-700">Tags</span>
                        <input
                          type="text"
                          value={editingState.meta.tags.join(', ')}
                          onChange={(event) =>
                            setEditingState((prev) => ({
                              ...prev,
                              meta: { ...prev.meta, tags: parseTags(event.target.value) }
                            }))
                          }
                          className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                        />
                      </label>
                      <div className="flex items-end gap-2 lg:col-span-3">
                        <button
                          type="button"
                          onClick={handleUpdate}
                          disabled={saving}
                          className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {saving ? 'Saving...' : 'Save changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export default Radar;
