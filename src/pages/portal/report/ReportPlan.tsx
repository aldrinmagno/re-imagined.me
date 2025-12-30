import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getActionPlan, saveActionPlan } from '../../../lib/actionPlanApi';
import { generateBalancedActionPlan, regenerateWeek } from '../../../lib/actionPlanGenerator';
import type { ActionPlanCategory, ActionPlanData } from '../../../types/actionPlan';
import { useReportContext } from '../../../components/report/ReportLayout';

function ReportPlan() {
  const {
    completedActions,
    toggleAction,
    progressError,
    reportContent,
    selectedRoleId,
    addPlanItem,
    updatePlanItem,
    deletePlanItem
  } = useReportContext();
  const { user } = useAuth();

  const [selectedPhaseId, setSelectedPhaseId] = useState('');
  const [actionTitle, setActionTitle] = useState('');
  const [timeEstimate, setTimeEstimate] = useState('');
  const [newPhaseTitle, setNewPhaseTitle] = useState('');
  const [newPhaseMonth, setNewPhaseMonth] = useState('');
  const [newPhaseDescription, setNewPhaseDescription] = useState('');
  const [planMessage, setPlanMessage] = useState('');
  const [planError, setPlanError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editEstimate, setEditEstimate] = useState('');
  const [editError, setEditError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlanData | null>(null);
  const [actionPlanError, setActionPlanError] = useState('');
  const [actionPlanSaving, setActionPlanSaving] = useState(false);

  const selectedRole = useMemo(
    () => reportContent.futureRoles.find((role) => role.id === selectedRoleId) || null,
    [reportContent.futureRoles, selectedRoleId]
  );

  const filteredPhases = useMemo(
    () =>
      selectedRoleId
        ? reportContent.actionPlanPhases.filter(
            (phase) => !phase.futureRoleId || phase.futureRoleId === selectedRoleId
          )
        : reportContent.actionPlanPhases,
    [reportContent.actionPlanPhases, selectedRoleId]
  );

  useEffect(() => {
    if (!filteredPhases.length) {
      setSelectedPhaseId('new');
      return;
    }

    if (!selectedPhaseId) {
      setSelectedPhaseId(filteredPhases[0].id);
    }
  }, [filteredPhases, selectedPhaseId]);

  useEffect(() => {
    const closeMenuOnClick = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('[data-plan-action-menu]')) {
        setOpenActionMenuId(null);
      }
    };

    document.addEventListener('mousedown', closeMenuOnClick);
    return () => document.removeEventListener('mousedown', closeMenuOnClick);
  }, []);

  useEffect(() => {
    if (!isAddModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAddModalOpen(false);
        resetForm();
        setPlanError('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen]);

  useEffect(() => {
    if (!user) return;
    const loadPlan = async () => {
      try {
        const record = await getActionPlan(user.id);
        if (record?.plan?.weeks?.length) {
          setActionPlan(record.plan);
        } else {
          const generated = generateBalancedActionPlan(reportContent);
          setActionPlan(generated);
          await saveActionPlan(user.id, generated);
        }
      } catch (planError) {
        setActionPlanError(planError instanceof Error ? planError.message : 'Unable to load your balanced plan.');
      }
    };
    void loadPlan();
  }, [reportContent, user]);

  const handleToggleWeek = async (weekIndex: number, category: ActionPlanCategory) => {
    if (!user || !actionPlan) return;
    const updated = {
      ...actionPlan,
      weeks: actionPlan.weeks.map((week, index) =>
        index === weekIndex ? { ...week, completed: { ...week.completed, [category]: !week.completed[category] } } : week
      )
    };
    setActionPlan(updated);
    setActionPlanSaving(true);
    try {
      await saveActionPlan(user.id, updated);
    } catch (saveError) {
      setActionPlanError(saveError instanceof Error ? saveError.message : 'Unable to save progress.');
    } finally {
      setActionPlanSaving(false);
    }
  };

  const handleRegenerateWeek = async (weekIndex: number) => {
    if (!user || !actionPlan) return;
    const updated = regenerateWeek(actionPlan, weekIndex, reportContent);
    setActionPlan(updated);
    setActionPlanSaving(true);
    try {
      await saveActionPlan(user.id, updated);
    } catch (saveError) {
      setActionPlanError(saveError instanceof Error ? saveError.message : 'Unable to regenerate this week.');
    } finally {
      setActionPlanSaving(false);
    }
  };

  const actionPlanProgress = useMemo(() => {
    if (!actionPlan) return 0;
    const total = actionPlan.weeks.length * 5;
    if (!total) return 0;
    const completed = actionPlan.weeks.reduce(
      (count, week) => count + Object.values(week.completed).filter(Boolean).length,
      0
    );
    return Math.round((completed / total) * 100);
  }, [actionPlan]);

  const isCreatingNewPhase = selectedPhaseId === 'new';

  const resetForm = () => {
    setActionTitle('');
    setTimeEstimate('');
    setPlanError('');
    setNewPhaseTitle('');
    setNewPhaseDescription('');
    setNewPhaseMonth('');
  };

  const handleAddPlan = async (event: FormEvent) => {
    event.preventDefault();
    setPlanError('');
    setPlanMessage('');

    if (!actionTitle.trim()) {
      setPlanError('Add a short title for your new plan item.');
      return;
    }

    if (isCreatingNewPhase && !newPhaseTitle.trim()) {
      setPlanError('Give your new section a name so we can place the item.');
      return;
    }

    setIsSubmitting(true);
    const result = await addPlanItem({
      actionTitle: actionTitle.trim(),
      estimate: timeEstimate.trim() || null,
      phaseId: isCreatingNewPhase ? undefined : selectedPhaseId,
      newPhase: isCreatingNewPhase
        ? {
            title: newPhaseTitle.trim(),
            description: newPhaseDescription.trim() || null,
            monthLabel: newPhaseMonth.trim() || null
          }
        : undefined,
      futureRoleId: selectedRoleId
    });

    setIsSubmitting(false);

    if (!result.success) {
      setPlanError(result.error || 'We could not add that item. Please try again.');
      return;
    }

    resetForm();
    if (result.phaseId) {
      setSelectedPhaseId(result.phaseId);
    }
    setPlanMessage('Plan item saved to your report.');
    setIsAddModalOpen(false);
  };

  const beginEdit = (title: string, estimate: string | null, id: string) => {
    setEditingActionId(id);
    setEditTitle(title);
    setEditEstimate(estimate || '');
    setEditError('');
  };

  const handleUpdate = async (id: string) => {
    if (!editTitle.trim()) {
      setEditError('Title cannot be empty.');
      return;
    }

    const result = await updatePlanItem(id, { actionTitle: editTitle.trim(), estimate: editEstimate.trim() || null });

    if (!result.success) {
      setEditError(result.error || 'Unable to update this item right now.');
      return;
    }

    setEditingActionId(null);
    setEditError('');
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deletePlanItem(id);
    setDeletingId(null);

    if (!result.success) {
      setPlanError(result.error || 'Unable to delete that plan item.');
    }
  };

  const categoryLabels: Record<ActionPlanCategory, string> = {
    upskill: 'Upskill',
    cv: 'CV',
    application: 'Application',
    networking: 'Networking',
    interview_prep: 'Interview prep'
  };

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">90-day action plan</p>
        <h2 className="text-lg font-semibold text-slate-900">A calm, paced plan across three months</h2>
        <p className="text-sm text-slate-700">
          Use the checkboxes to mark progress. Each action includes a light weekly time signal so you can fit it in alongside
          work and life.
        </p>
        <p className="text-sm text-slate-700">
          {selectedRole
            ? `Focusing on: ${selectedRole.title}. You can switch roles from the Future roles & skills section.`
            : 'Showing plan items across all suggested roles. Pick one to focus the plan.'}
        </p>
        {progressError ? <p className="text-sm text-amber-700">{progressError}</p> : null}
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">Add to your plan</h3>
            <p className="text-xs text-slate-700">
              Create your own items to complement the generated plan. New entries are saved to this report.
            </p>
            {planMessage ? <p className="text-xs text-emerald-700">{planMessage}</p> : null}
            {planError ? <p className="text-xs text-amber-700">{planError}</p> : null}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setPlanError('');
                setPlanMessage('');
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-white"
            >
              + Add plan item
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Balanced weekly plan</p>
            <h3 className="text-lg font-semibold text-slate-900">Every week covers skill, CV, applications, networking, and interviews.</h3>
            <p className="text-sm text-slate-700">
              Progress: {actionPlanProgress}% complete {actionPlanSaving ? '• Saving...' : ''}
            </p>
          </div>
        </div>
        {actionPlanError ? <p className="text-sm text-amber-700">{actionPlanError}</p> : null}
        {!actionPlan ? (
          <p className="text-sm text-slate-600">Building your balanced plan...</p>
        ) : (
          <div className="space-y-4">
            {actionPlan.weeks.map((week, index) => (
              <div key={week.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{week.label}</p>
                  <button
                    type="button"
                    onClick={() => handleRegenerateWeek(index)}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Regenerate this week
                  </button>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {(Object.keys(week.tasks) as ActionPlanCategory[]).map((category) => (
                    <label key={category} className="flex items-start gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={week.completed[category]}
                        onChange={() => handleToggleWeek(index, category)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
                      />
                      <span>
                        <span className="font-semibold text-slate-800">{categoryLabels[category]}:</span>{' '}
                        {week.tasks[category]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddModalOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsAddModalOpen(false);
              resetForm();
              setPlanError('');
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Add to your plan</p>
                <h3 className="text-lg font-semibold text-slate-900">Place a new action item</h3>
                <p className="text-sm text-slate-700">
                  Choose where this action belongs. You can also create a brand new section for it.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                  setPlanError('');
                }}
                className="rounded-full border border-slate-200 p-2 text-slate-700 transition hover:border-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-white"
              >
                ✕
              </button>
            </div>

            <form className="mt-4 space-y-4" onSubmit={handleAddPlan}>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-slate-800">
                  Action title
                  <input
                    type="text"
                    value={actionTitle}
                    onChange={(event) => setActionTitle(event.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                    placeholder="e.g. Share a weekly progress note"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-800">
                  Time per week (optional)
                  <input
                    type="text"
                    value={timeEstimate}
                    onChange={(event) => setTimeEstimate(event.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                    placeholder="e.g. 1-2 hours"
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-slate-800">
                  Place this item
                  <select
                    value={selectedPhaseId}
                    onChange={(event) => setSelectedPhaseId(event.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                  >
                    {filteredPhases.map((phase) => (
                      <option key={phase.id} value={phase.id}>
                        {phase.title}
                      </option>
                    ))}
                    <option value="new">Create a new section</option>
                  </select>
                </label>
                {isCreatingNewPhase ? (
                  <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                    <label className="flex flex-col gap-1 text-sm text-slate-800">
                      New section title
                      <input
                        type="text"
                        value={newPhaseTitle}
                        onChange={(event) => setNewPhaseTitle(event.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                        placeholder="e.g. Month 2 – Build credibility"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-800">
                      Month label (optional)
                      <input
                        type="text"
                        value={newPhaseMonth}
                        onChange={(event) => setNewPhaseMonth(event.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                        placeholder="Month 1"
                      />
                    </label>
                    <label className="md:col-span-2 flex flex-col gap-1 text-sm text-slate-800">
                      Description (optional)
                      <textarea
                        value={newPhaseDescription}
                        onChange={(event) => setNewPhaseDescription(event.target.value)}
                        className="h-20 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                        placeholder="Add a short note for this section"
                      />
                    </label>
                  </div>
                ) : null}
              </div>

              {planError ? <p className="text-sm text-amber-700">{planError}</p> : null}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-200 disabled:text-emerald-900"
                >
                  {isSubmitting ? 'Saving…' : 'Save to plan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="text-sm font-semibold text-slate-800 hover:text-slate-900"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-1">
        {filteredPhases.length ? (
          filteredPhases.map((phase) => (
            <article
              key={phase.id}
              className="flex flex-col gap-3 rounded-xl shadow-sm"
            >
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-700">{phase.title}</p>
                <p className="text-sm text-slate-800">{phase.description || 'More details coming soon.'}</p>
              </div>
              <ul className="space-y-2">
                {phase.items.map((item) => {
                  const actionId = `action-${item.id}`;
                  const isCompleted = completedActions.has(item.id);

                  if (editingActionId === item.id) {
                    return (
                      <li key={item.id} className="rounded-lg border border-slate-200/70 bg-slate-50 p-3">
                        <div className="grid gap-2 md:grid-cols-2 md:gap-3">
                          <label className="flex flex-col gap-1 text-sm text-slate-800">
                            Action title
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(event) => setEditTitle(event.target.value)}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm text-slate-800">
                            Time per week
                            <input
                              type="text"
                              value={editEstimate}
                              onChange={(event) => setEditEstimate(event.target.value)}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                            />
                          </label>
                        </div>
                        {editError ? <p className="text-sm text-amber-700">{editError}</p> : null}
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdate(item.id)}
                            className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-emerald-400"
                          >
                            Save changes
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingActionId(null)}
                            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-800 hover:border-slate-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={item.id} className="relative">
                      <div
                        className={`group flex items-start gap-3 rounded-lg border px-3 py-2 transition hover:border-emerald-400/70 ${
                          isCompleted ? 'border-emerald-400/70 bg-emerald-50 text-emerald-900' : 'border-slate-200/70 bg-slate-50 text-slate-800'
                        }`}
                      >
                        <input
                          id={actionId}
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => toggleAction(item.id)}
                          className="sr-only"
                        />
                        <label htmlFor={actionId} className="flex flex-1 cursor-pointer items-start gap-3">
                          <span
                            aria-hidden
                              className={`mt-1 flex h-5 w-5 items-center justify-center rounded border text-xs font-semibold transition ${
                                isCompleted ? 'border-emerald-300 bg-emerald-400 text-slate-900' : 'border-slate-300 bg-white text-transparent'
                              }`}
                          >
                            ✓
                          </span>
                          <div className="flex flex-1 flex-col gap-1">
                            <span className="text-sm font-medium leading-snug">{item.title}</span>
                            <span className="text-xs text-slate-700">
                              {item.estimate ? `${item.estimate} to keep moving` : 'Time estimate coming soon.'}
                            </span>
                          </div>
                        </label>
                        <div className="relative flex items-center" data-plan-action-menu>
                          <button
                            type="button"
                            aria-label="Open actions"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenActionMenuId((current) => (current === item.id ? null : item.id));
                            }}
                            className="rounded-full border border-slate-200 p-2 text-slate-800 transition hover:border-emerald-400/70 hover:text-slate-900"
                          >
                            <span aria-hidden>⚙</span>
                          </button>
                            {openActionMenuId === item.id ? (
                              <div className="absolute right-0 top-10 z-10 w-40 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setOpenActionMenuId(null);
                                    beginEdit(item.title, item.estimate || null, item.id);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
                                >
                                  Edit item
                                </button>
                                <button
                                  type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenActionMenuId(null);
                                  handleDelete(item.id);
                                }}
                                disabled={deletingId === item.id}
                                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {deletingId === item.id ? 'Removing…' : 'Delete'}
                                </button>
                              </div>
                            ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-700">
            {selectedRole
              ? 'There are no plan items for this role yet. Add your own above or pick another role to view its plan.'
              : 'Your personalised plan will appear here once your report has been generated. You can start drafting your own items above.'}
          </div>
        )}
      </div>
    </section>
  );
}

export default ReportPlan;
