import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  createNetworkContact,
  createNetworkTask,
  deleteNetworkContact,
  deleteNetworkTask,
  getNetworkContacts,
  getNetworkTasks,
  updateNetworkContact,
  updateNetworkTask
} from '../../lib/networkingApi';
import { buildTemplate, getContactLabel, sortTasksByDueDate } from '../../lib/networkingUtils';
import type { NetworkContactRecord, NetworkTaskRecord, NetworkTaskStatus, OutreachTemplate } from '../../types/networking';

const templates: OutreachTemplate[] = [
  {
    id: 'warm-intro',
    label: 'Warm introduction',
    content:
      'Hi {name}, I enjoyed learning about your work at {org}. I am exploring new roles and would love to stay in touch.'
  },
  {
    id: 'follow-up',
    label: 'Follow-up touchpoint',
    content: 'Hi {name}, just checking in on our last conversation. Would you be open to reconnecting soon?'
  },
  {
    id: 'referral',
    label: 'Referral request',
    content:
      'Hi {name}, I noticed an opening at {org} and would appreciate any guidance you can share on the team and process.'
  }
];

const emptyContact = (): Omit<NetworkContactRecord, 'id' | 'user_id' | 'updated_at'> => ({
  name: '',
  org: '',
  role: '',
  channel: '',
  last_contacted: '',
  next_follow_up: '',
  notes: ''
});

const emptyTask = (): Omit<NetworkTaskRecord, 'id' | 'user_id' | 'updated_at'> => ({
  task: '',
  due_date: '',
  status: 'pending',
  linked_contact_id: null
});

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : '—');

function Networking() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<NetworkContactRecord[]>([]);
  const [tasks, setTasks] = useState<NetworkTaskRecord[]>([]);
  const [contactForm, setContactForm] = useState(emptyContact());
  const [taskForm, setTaskForm] = useState(emptyTask());
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0].id);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editingContactState, setEditingContactState] = useState(emptyContact());
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskState, setEditingTaskState] = useState(emptyTask());

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === selectedContactId) ?? null,
    [contacts, selectedContactId]
  );

  const sortedTasks = useMemo(() => sortTasksByDueDate(tasks), [tasks]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [contactsData, tasksData] = await Promise.all([getNetworkContacts(user.id), getNetworkTasks(user.id)]);
        setContacts(contactsData);
        setTasks(tasksData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load networking data.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user]);

  const handleContactSubmit = async () => {
    if (!user) return;
    if (!contactForm.name.trim()) {
      setError('Contact name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createNetworkContact(user.id, {
        ...contactForm,
        org: contactForm.org || null,
        role: contactForm.role || null,
        channel: contactForm.channel || null,
        last_contacted: contactForm.last_contacted || null,
        next_follow_up: contactForm.next_follow_up || null,
        notes: contactForm.notes || null
      });
      setContacts((prev) => [created, ...prev]);
      setContactForm(emptyContact());
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save contact.');
    } finally {
      setSaving(false);
    }
  };

  const handleTaskSubmit = async () => {
    if (!user) return;
    if (!taskForm.task.trim()) {
      setError('Task is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createNetworkTask(user.id, {
        ...taskForm,
        due_date: taskForm.due_date || null,
        linked_contact_id: taskForm.linked_contact_id || null
      });
      setTasks((prev) => [created, ...prev]);
      setTaskForm(emptyTask());
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save task.');
    } finally {
      setSaving(false);
    }
  };

  const handleContactUpdate = async () => {
    if (!user || !editingContactId) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateNetworkContact(user.id, editingContactId, {
        ...editingContactState,
        org: editingContactState.org || null,
        role: editingContactState.role || null,
        channel: editingContactState.channel || null,
        last_contacted: editingContactState.last_contacted || null,
        next_follow_up: editingContactState.next_follow_up || null,
        notes: editingContactState.notes || null
      });
      setContacts((prev) => prev.map((contact) => (contact.id === updated.id ? updated : contact)));
      setEditingContactId(null);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update contact.');
    } finally {
      setSaving(false);
    }
  };

  const handleTaskUpdate = async () => {
    if (!user || !editingTaskId) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateNetworkTask(user.id, editingTaskId, {
        ...editingTaskState,
        due_date: editingTaskState.due_date || null,
        linked_contact_id: editingTaskState.linked_contact_id || null
      });
      setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)));
      setEditingTaskId(null);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update task.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await deleteNetworkContact(user.id, id);
      setContacts((prev) => prev.filter((contact) => contact.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete contact.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await deleteNetworkTask(user.id, id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete task.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-600">Loading networking tracker...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Networking Tracker</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Keep your outreach organized.</h1>
            <p className="mt-2 text-sm text-slate-600">
              Track contacts, set outreach tasks, and use templates to stay consistent.
            </p>
          </div>
        </div>
        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Add a contact</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Name</span>
            <input
              type="text"
              value={contactForm.name}
              onChange={(event) => setContactForm((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Organization</span>
            <input
              type="text"
              value={contactForm.org}
              onChange={(event) => setContactForm((prev) => ({ ...prev, org: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Role</span>
            <input
              type="text"
              value={contactForm.role}
              onChange={(event) => setContactForm((prev) => ({ ...prev, role: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Channel</span>
            <input
              type="text"
              value={contactForm.channel}
              onChange={(event) => setContactForm((prev) => ({ ...prev, channel: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="LinkedIn, email, referral"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Last contacted</span>
            <input
              type="date"
              value={contactForm.last_contacted}
              onChange={(event) => setContactForm((prev) => ({ ...prev, last_contacted: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Next follow-up</span>
            <input
              type="date"
              value={contactForm.next_follow_up}
              onChange={(event) => setContactForm((prev) => ({ ...prev, next_follow_up: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm lg:col-span-3">
            <span className="font-medium text-slate-700">Notes</span>
            <textarea
              value={contactForm.notes}
              onChange={(event) => setContactForm((prev) => ({ ...prev, notes: event.target.value }))}
              rows={3}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleContactSubmit}
            disabled={saving}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? 'Saving...' : 'Add contact'}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Add an outreach task</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm lg:col-span-2">
            <span className="font-medium text-slate-700">Task</span>
            <input
              type="text"
              value={taskForm.task}
              onChange={(event) => setTaskForm((prev) => ({ ...prev, task: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Due date</span>
            <input
              type="date"
              value={taskForm.due_date}
              onChange={(event) => setTaskForm((prev) => ({ ...prev, due_date: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Status</span>
            <select
              value={taskForm.status}
              onChange={(event) =>
                setTaskForm((prev) => ({ ...prev, status: event.target.value as NetworkTaskStatus }))
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              <option value="pending">Pending</option>
              <option value="done">Done</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm lg:col-span-2">
            <span className="font-medium text-slate-700">Linked contact</span>
            <select
              value={taskForm.linked_contact_id ?? ''}
              onChange={(event) =>
                setTaskForm((prev) => ({ ...prev, linked_contact_id: event.target.value || null }))
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">No contact</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleTaskSubmit}
            disabled={saving}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? 'Saving...' : 'Add task'}
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Contacts</h2>
          </div>
          {contacts.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No contacts yet. Add one above.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {contacts.map((contact) => (
                <article key={contact.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
                      <p className="text-xs text-slate-500">
                        {contact.role || 'Role'} · {contact.org || 'Org'} · {contact.channel || 'Channel'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingContactId(contact.id);
                          setEditingContactState({
                            name: contact.name,
                            org: contact.org ?? '',
                            role: contact.role ?? '',
                            channel: contact.channel ?? '',
                            last_contacted: contact.last_contacted ?? '',
                            next_follow_up: contact.next_follow_up ?? '',
                            notes: contact.notes ?? ''
                          });
                        }}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteContact(contact.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-600">
                    <p>Last contacted: {formatDate(contact.last_contacted)}</p>
                    <p>Next follow-up: {formatDate(contact.next_follow_up)}</p>
                    {contact.notes && <p className="mt-2">{contact.notes}</p>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Outreach templates</h2>
          <div className="mt-4 space-y-3">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Template</span>
              <select
                value={selectedTemplateId}
                onChange={(event) => setSelectedTemplateId(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Contact</span>
              <select
                value={selectedContactId ?? ''}
                onChange={(event) => setSelectedContactId(event.target.value || null)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Select contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {getContactLabel(selectedContact)}
              </p>
              <p className="mt-2 whitespace-pre-wrap">
                {buildTemplate(
                  templates.find((template) => template.id === selectedTemplateId)?.content ?? '',
                  selectedContact
                )}
              </p>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard?.writeText(
                    buildTemplate(
                      templates.find((template) => template.id === selectedTemplateId)?.content ?? '',
                      selectedContact
                    )
                  )
                }
                className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Copy template
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Outreach tasks</h2>
        {sortedTasks.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No tasks yet. Add one above.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {sortedTasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{task.task}</p>
                    <p className="text-xs text-slate-500">
                      Due {formatDate(task.due_date)} • {task.status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setEditingTaskState({
                          task: task.task,
                          due_date: task.due_date ?? '',
                          status: task.status,
                          linked_contact_id: task.linked_contact_id
                        });
                      }}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {task.linked_contact_id && (
                  <p className="mt-2 text-xs text-slate-600">
                    Linked contact:{' '}
                    {contacts.find((contact) => contact.id === task.linked_contact_id)?.name ?? 'Contact'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {editingContactId && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Edit contact</p>
              <p className="text-sm text-slate-600">Update contact details.</p>
            </div>
            <button
              type="button"
              onClick={() => setEditingContactId(null)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-700"
            >
              Close
            </button>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Name</span>
              <input
                type="text"
                value={editingContactState.name}
                onChange={(event) => setEditingContactState((prev) => ({ ...prev, name: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Organization</span>
              <input
                type="text"
                value={editingContactState.org}
                onChange={(event) => setEditingContactState((prev) => ({ ...prev, org: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Role</span>
              <input
                type="text"
                value={editingContactState.role}
                onChange={(event) => setEditingContactState((prev) => ({ ...prev, role: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Channel</span>
              <input
                type="text"
                value={editingContactState.channel}
                onChange={(event) => setEditingContactState((prev) => ({ ...prev, channel: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Last contacted</span>
              <input
                type="date"
                value={editingContactState.last_contacted}
                onChange={(event) => setEditingContactState((prev) => ({ ...prev, last_contacted: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Next follow-up</span>
              <input
                type="date"
                value={editingContactState.next_follow_up}
                onChange={(event) => setEditingContactState((prev) => ({ ...prev, next_follow_up: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm lg:col-span-3">
              <span className="font-medium text-slate-700">Notes</span>
              <textarea
                value={editingContactState.notes}
                onChange={(event) => setEditingContactState((prev) => ({ ...prev, notes: event.target.value }))}
                rows={3}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleContactUpdate}
              disabled={saving}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => setEditingContactId(null)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {editingTaskId && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Edit task</p>
              <p className="text-sm text-slate-600">Update your outreach task.</p>
            </div>
            <button
              type="button"
              onClick={() => setEditingTaskId(null)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-700"
            >
              Close
            </button>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm lg:col-span-2">
              <span className="font-medium text-slate-700">Task</span>
              <input
                type="text"
                value={editingTaskState.task}
                onChange={(event) => setEditingTaskState((prev) => ({ ...prev, task: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Due date</span>
              <input
                type="date"
                value={editingTaskState.due_date}
                onChange={(event) => setEditingTaskState((prev) => ({ ...prev, due_date: event.target.value }))}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-700">Status</span>
              <select
                value={editingTaskState.status}
                onChange={(event) =>
                  setEditingTaskState((prev) => ({ ...prev, status: event.target.value as NetworkTaskStatus }))
                }
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <option value="pending">Pending</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm lg:col-span-2">
              <span className="font-medium text-slate-700">Linked contact</span>
              <select
                value={editingTaskState.linked_contact_id ?? ''}
                onChange={(event) =>
                  setEditingTaskState((prev) => ({ ...prev, linked_contact_id: event.target.value || null }))
                }
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <option value="">No contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleTaskUpdate}
              disabled={saving}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => setEditingTaskId(null)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default Networking;
