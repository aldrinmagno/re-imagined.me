import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createApplication, deleteApplication, getApplications, updateApplication } from '../../lib/applicationsApi';
import { createApplicationComm, getApplicationComms } from '../../lib/applicationCommsApi';
import { generateApplicationComms } from '../../lib/applicationCommsGenerator';
import { logJobSearchEvent } from '../../lib/jobSearchEventsApi';
import { getSuggestedFollowUpDate, isFollowUpDue } from '../../lib/applicationUtils';
import { formatDate } from '../../lib/dateUtils';
import type { ApplicationRecord, ApplicationStatus } from '../../types/applications';
import type { ApplicationCommRecord, ApplicationCommType } from '../../types/applicationComms';

const statusColumns: ApplicationStatus[] = ['applied', 'interviewing', 'offer', 'rejected'];

const emptyApplication = (): Omit<ApplicationRecord, 'id' | 'updated_at' | 'user_id'> => ({
  company: '',
  role_title: '',
  source: '',
  date_applied: '',
  status: 'applied',
  contact: '',
  notes: '',
  next_step: '',
  next_step_date: ''
});


function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [formState, setFormState] = useState(emptyApplication());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingState, setEditingState] = useState(emptyApplication());
  const [commsOpenId, setCommsOpenId] = useState<string | null>(null);
  const [commsTone, setCommsTone] = useState<'direct' | 'warm' | 'confident'>('warm');
  const [commsPayload, setCommsPayload] = useState<{
    call_script: string;
    email_template: string;
    linkedin_message: string;
  } | null>(null);
  const [commsHistory, setCommsHistory] = useState<ApplicationCommRecord[]>([]);
  const [commsLoading, setCommsLoading] = useState(false);

  useEffect(() => {
    if (!commsOpenId) return;
    const application = applications.find((item) => item.id === commsOpenId);
    if (!application) return;
    setCommsPayload(generateApplicationComms(application, commsTone));
  }, [applications, commsOpenId, commsTone]);

  const groupedByStatus = useMemo(
    () =>
      statusColumns.reduce<Record<ApplicationStatus, ApplicationRecord[]>>((acc, status) => {
        acc[status] = applications.filter((application) => application.status === status);
        return acc;
      }, {} as Record<ApplicationStatus, ApplicationRecord[]>),
    [applications]
  );

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getApplications(user.id);
        setApplications(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load applications.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user]);

  const updateForm = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'date_applied' && !prev.next_step_date) {
        const suggested = getSuggestedFollowUpDate(value);
        if (suggested) {
          next.next_step_date = suggested;
        }
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!formState.company.trim() || !formState.role_title.trim()) {
      setError('Company and role title are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createApplication(user.id, {
        ...formState,
        source: formState.source || null,
        date_applied: formState.date_applied || null,
        contact: formState.contact || null,
        notes: formState.notes || null,
        next_step: formState.next_step || null,
        next_step_date: formState.next_step_date || null
      });
      await logJobSearchEvent(user.id, 'apply', {
        application_id: created.id,
        company: created.company,
        role_title: created.role_title
      });
      setApplications((prev) => [created, ...prev]);
      setFormState(emptyApplication());
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save application.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (application: ApplicationRecord) => {
    setEditingId(application.id);
    setEditingState({
      company: application.company,
      role_title: application.role_title,
      source: application.source ?? '',
      date_applied: application.date_applied ?? '',
      status: application.status,
      contact: application.contact ?? '',
      notes: application.notes ?? '',
      next_step: application.next_step ?? '',
      next_step_date: application.next_step_date ?? ''
    });
  };

  const handleUpdate = async () => {
    if (!user || !editingId) return;
    setSaving(true);
    setError(null);
    try {
      const previousStatus = applications.find((application) => application.id === editingId)?.status;
      const updated = await updateApplication(user.id, editingId, {
        ...editingState,
        source: editingState.source || null,
        date_applied: editingState.date_applied || null,
        contact: editingState.contact || null,
        notes: editingState.notes || null,
        next_step: editingState.next_step || null,
        next_step_date: editingState.next_step_date || null
      });
      if (editingState.status !== previousStatus) {
        const statusEvent =
          editingState.status === 'interviewing'
            ? 'interview'
            : editingState.status === 'offer'
              ? 'offer'
              : editingState.status === 'rejected'
                ? 'reject'
                : null;
        if (statusEvent) {
          await logJobSearchEvent(user.id, statusEvent, {
            application_id: updated.id,
            company: updated.company,
            role_title: updated.role_title
          });
        }
      }
      setApplications((prev) => prev.map((application) => (application.id === updated.id ? updated : application)));
      setEditingId(null);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update application.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await deleteApplication(user.id, id);
      setApplications((prev) => prev.filter((application) => application.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete application.');
    } finally {
      setSaving(false);
    }
  };

  const openComms = async (application: ApplicationRecord) => {
    if (!user) return;
    setCommsOpenId(application.id);
    setCommsPayload(generateApplicationComms(application, commsTone));
    setCommsLoading(true);
    try {
      const history = await getApplicationComms(user.id, application.id);
      setCommsHistory(history);
    } catch (historyError) {
      setError(historyError instanceof Error ? historyError.message : 'Unable to load follow-up scripts.');
    } finally {
      setCommsLoading(false);
    }
  };

  const handleGenerateComms = async () => {
    if (!user || !commsOpenId) return;
    const application = applications.find((item) => item.id === commsOpenId);
    if (!application) return;
    const generated = generateApplicationComms(application, commsTone);
    setCommsPayload(generated);
    setCommsLoading(true);
    try {
      const entries: ApplicationCommRecord[] = [];
      for (const [type, content] of Object.entries(generated) as [ApplicationCommType, string][]) {
        const saved = await createApplicationComm(user.id, commsOpenId, type, content);
        entries.push(saved);
      }
      await logJobSearchEvent(user.id, 'followup', {
        application_id: commsOpenId,
        tone: commsTone
      });
      setCommsHistory((prev) => [...entries, ...prev]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save follow-up scripts.');
    } finally {
      setCommsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-600">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Application Tracker</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Track every application and follow-up.</h1>
            <p className="mt-2 text-sm text-slate-600">
              Log roles, keep next steps visible, and toggle between table and kanban views.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView('table')}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                view === 'table'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-emerald-700'
              }`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setView('kanban')}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                view === 'kanban'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-emerald-700'
              }`}
            >
              Kanban
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Add a new application</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Company</span>
            <input
              type="text"
              value={formState.company}
              onChange={(event) => updateForm('company', event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Role title</span>
            <input
              type="text"
              value={formState.role_title}
              onChange={(event) => updateForm('role_title', event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Source</span>
            <input
              type="text"
              value={formState.source}
              onChange={(event) => updateForm('source', event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="Referral, LinkedIn, company site"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Date applied</span>
            <input
              type="date"
              value={formState.date_applied}
              onChange={(event) => updateForm('date_applied', event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Status</span>
            <select
              value={formState.status}
              onChange={(event) => updateForm('status', event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              {statusColumns.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Contact</span>
            <input
              type="text"
              value={formState.contact}
              onChange={(event) => updateForm('contact', event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm lg:col-span-2">
            <span className="font-medium text-slate-700">Notes</span>
            <textarea
              value={formState.notes}
              onChange={(event) => updateForm('notes', event.target.value)}
              rows={3}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Next step</span>
            <input
              type="text"
              value={formState.next_step}
              onChange={(event) => updateForm('next_step', event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="Follow up, send portfolio"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Next step date</span>
            <input
              type="date"
              value={formState.next_step_date}
              onChange={(event) => updateForm('next_step_date', event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <span className="text-xs text-slate-500">
              Suggested follow-up: {getSuggestedFollowUpDate(formState.date_applied) ?? 'Add date applied'}
            </span>
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? 'Saving...' : 'Add application'}
          </button>
        </div>
      </section>

      {view === 'table' ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="overflow-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="pb-3">Company</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Applied</th>
                  <th className="pb-3">Next step</th>
                  <th className="pb-3">Follow-up</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-sm text-slate-500">
                      No applications yet. Add one above to get started.
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => {
                    const followUpDue = isFollowUpDue(application);
                    return (
                      <tr key={application.id} className={followUpDue ? 'bg-amber-50' : undefined}>
                        <td className="py-3 font-semibold text-slate-900">{application.company}</td>
                        <td className="py-3 text-slate-700">{application.role_title}</td>
                        <td className="py-3 text-slate-600">{application.status}</td>
                        <td className="py-3 text-slate-600">{formatDate(application.date_applied)}</td>
                        <td className="py-3 text-slate-600">{application.next_step || '—'}</td>
                        <td className="py-3 text-slate-600">
                          {followUpDue ? 'Follow-up due' : formatDate(application.next_step_date)}
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(application)}
                              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => openComms(application)}
                              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                            >
                              Follow-up scripts
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(application.id)}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-4">
          {statusColumns.map((status) => (
            <div key={status} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </p>
                <span className="text-xs text-slate-500">{groupedByStatus[status]?.length ?? 0}</span>
              </div>
              <div className="mt-3 flex flex-col gap-3">
                {groupedByStatus[status]?.length ? (
                  groupedByStatus[status].map((application) => {
                    const followUpDue = isFollowUpDue(application);
                    return (
                      <div key={application.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-sm font-semibold text-slate-900">{application.company}</p>
                        <p className="text-xs text-slate-600">{application.role_title}</p>
                        <p className="text-xs text-slate-500">Applied {formatDate(application.date_applied)}</p>
                        {followUpDue && (
                          <p className="mt-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                            Follow-up due
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(application)}
                            className="font-semibold text-emerald-600 hover:text-emerald-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openComms(application)}
                            className="font-semibold text-emerald-600 hover:text-emerald-700"
                          >
                            Scripts
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(application.id)}
                            className="font-semibold text-rose-600 hover:text-rose-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500">No applications yet.</p>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {editingId && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Edit application</p>
              <p className="text-sm text-slate-600">Update details and save changes.</p>
            </div>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-700"
            >
              Close
            </button>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Company</span>
              <input
                type="text"
                value={editingState.company}
                onChange={(event) => setEditingState((prev) => ({ ...prev, company: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Role title</span>
              <input
                type="text"
                value={editingState.role_title}
                onChange={(event) => setEditingState((prev) => ({ ...prev, role_title: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Status</span>
              <select
                value={editingState.status}
                onChange={(event) =>
                  setEditingState((prev) => ({ ...prev, status: event.target.value as ApplicationStatus }))
                }
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                {statusColumns.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Source</span>
              <input
                type="text"
                value={editingState.source}
                onChange={(event) => setEditingState((prev) => ({ ...prev, source: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Date applied</span>
              <input
                type="date"
                value={editingState.date_applied}
                onChange={(event) => setEditingState((prev) => ({ ...prev, date_applied: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Contact</span>
              <input
                type="text"
                value={editingState.contact}
                onChange={(event) => setEditingState((prev) => ({ ...prev, contact: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm lg:col-span-2">
              <span className="font-medium text-slate-700">Notes</span>
              <textarea
                value={editingState.notes}
                onChange={(event) => setEditingState((prev) => ({ ...prev, notes: event.target.value }))}
                rows={3}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Next step</span>
              <input
                type="text"
                value={editingState.next_step}
                onChange={(event) => setEditingState((prev) => ({ ...prev, next_step: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Next step date</span>
              <input
                type="date"
                value={editingState.next_step_date}
                onChange={(event) => setEditingState((prev) => ({ ...prev, next_step_date: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleUpdate}
              disabled={saving}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {commsOpenId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Follow-up scripts</p>
                <h2 className="text-lg font-semibold text-slate-900">Generate outreach with the right tone.</h2>
                <p className="text-sm text-slate-600">Pick a tone, generate scripts, and copy as needed.</p>
              </div>
              <button
                type="button"
                onClick={() => setCommsOpenId(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {(['warm', 'direct', 'confident'] as const).map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setCommsTone(tone)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    commsTone === tone
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-emerald-700'
                  }`}
                >
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </button>
              ))}
              <button
                type="button"
                onClick={handleGenerateComms}
                disabled={commsLoading}
                className="ml-auto rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {commsLoading ? 'Generating...' : 'Generate scripts'}
              </button>
            </div>

            {commsPayload && (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {Object.entries(commsPayload).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {key.replace('_', ' ')}
                    </p>
                    <textarea
                      value={value}
                      readOnly
                      rows={8}
                      className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(value)}
                      className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Previously generated</p>
              {commsLoading ? (
                <p className="mt-2 text-sm text-slate-500">Loading scripts...</p>
              ) : commsHistory.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No saved scripts yet.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {commsHistory.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
                      <p className="font-semibold text-slate-700">{item.type.replace('_', ' ')}</p>
                      <p className="mt-1 whitespace-pre-wrap">{item.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Applications;
