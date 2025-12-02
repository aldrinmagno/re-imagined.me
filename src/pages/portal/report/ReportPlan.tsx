import { FormEvent, useEffect, useMemo, useState } from 'react';
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

  const [selectedPhaseId, setSelectedPhaseId] = useState('');
  const [actionTitle, setActionTitle] = useState('');
  const [timeEstimate, setTimeEstimate] = useState('');
  const [newPhaseTitle, setNewPhaseTitle] = useState('');
  const [newPhaseMonth, setNewPhaseMonth] = useState('');
  const [newPhaseDescription, setNewPhaseDescription] = useState('');
  const [planMessage, setPlanMessage] = useState('');
  const [planError, setPlanError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editEstimate, setEditEstimate] = useState('');
  const [editError, setEditError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">90-day action plan</p>
        <h2 className="text-lg font-semibold text-white">A calm, paced plan across three months</h2>
        <p className="text-sm text-slate-300">
          Use the checkboxes to mark progress. Each action includes a light weekly time signal so you can fit it in alongside
          work and life.
        </p>
        <p className="text-sm text-slate-300">
          {selectedRole
            ? `Focusing on: ${selectedRole.title}. You can switch roles from the Future roles & skills section.`
            : 'Showing plan items across all suggested roles. Pick one to focus the plan.'}
        </p>
        {progressError ? <p className="text-sm text-amber-300">{progressError}</p> : null}
      </div>

      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white">Add to your plan</h3>
          <p className="text-xs text-slate-300">
            Create your own items to complement the generated plan. New entries are saved to this report.
          </p>
        </div>
        <form className="space-y-3" onSubmit={handleAddPlan}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              Action title
              <input
                type="text"
                value={actionTitle}
                onChange={(event) => setActionTitle(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="e.g. Share a weekly progress note"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              Time per week (optional)
              <input
                type="text"
                value={timeEstimate}
                onChange={(event) => setTimeEstimate(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="e.g. 1-2 hours"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              Place this item
              <select
                value={selectedPhaseId}
                onChange={(event) => setSelectedPhaseId(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
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
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  New section title
                  <input
                    type="text"
                    value={newPhaseTitle}
                    onChange={(event) => setNewPhaseTitle(event.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                    placeholder="e.g. Month 2 – Build credibility"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  Month label (optional)
                  <input
                    type="text"
                    value={newPhaseMonth}
                    onChange={(event) => setNewPhaseMonth(event.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                    placeholder="Month 1"
                  />
                </label>
                <label className="md:col-span-2 flex flex-col gap-1 text-sm text-slate-200">
                  Description (optional)
                  <textarea
                    value={newPhaseDescription}
                    onChange={(event) => setNewPhaseDescription(event.target.value)}
                    className="h-20 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                    placeholder="Add a short note for this section"
                  />
                </label>
              </div>
            ) : null}
          </div>

          {planError ? <p className="text-sm text-amber-300">{planError}</p> : null}
          {planMessage ? <p className="text-sm text-emerald-300">{planMessage}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800"
          >
            {isSubmitting ? 'Saving…' : 'Add plan item'}
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        {filteredPhases.length ? (
          filteredPhases.map((phase) => (
            <article
              key={phase.id}
              className="flex flex-col gap-3 rounded-xl shadow-sm"
            >
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-300">{phase.title}</p>
                <p className="text-sm text-slate-200">{phase.description || 'More details coming soon.'}</p>
              </div>
              <ul className="space-y-2">
                {phase.items.map((item) => {
                  const actionId = `action-${item.id}`;
                  const isCompleted = completedActions.has(item.id);

                  if (editingActionId === item.id) {
                    return (
                      <li key={item.id} className="rounded-lg border border-slate-800/70 bg-slate-900/80 p-3">
                        <div className="grid gap-2 md:grid-cols-2 md:gap-3">
                          <label className="flex flex-col gap-1 text-sm text-slate-200">
                            Action title
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(event) => setEditTitle(event.target.value)}
                              className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm text-slate-200">
                            Time per week
                            <input
                              type="text"
                              value={editEstimate}
                              onChange={(event) => setEditEstimate(event.target.value)}
                              className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                            />
                          </label>
                        </div>
                        {editError ? <p className="text-sm text-amber-300">{editError}</p> : null}
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
                            className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 hover:border-slate-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={item.id}>
                      <label
                        htmlFor={actionId}
                        className={`group flex items-start gap-3 rounded-lg border px-3 py-2 transition hover:border-emerald-400/70 ${
                          isCompleted ? 'border-emerald-400/70 bg-emerald-500/10 text-emerald-50' : 'border-slate-800/70 bg-slate-900/80 text-slate-100'
                        }`}
                      >
                        <input
                          id={actionId}
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => toggleAction(item.id)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden
                          className={`mt-1 flex h-5 w-5 items-center justify-center rounded border text-xs font-semibold transition ${
                            isCompleted ? 'border-emerald-300 bg-emerald-400 text-slate-900' : 'border-slate-600 bg-slate-800 text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                        <div className="flex flex-1 flex-col gap-1">
                          <span className="text-sm font-medium leading-snug">{item.title}</span>
                          <span className="text-xs text-slate-300">
                            {item.estimate ? `${item.estimate} to keep moving` : 'Time estimate coming soon.'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              beginEdit(item.title, item.estimate || null, item.id);
                            }}
                            className="rounded-lg border border-slate-700 px-2 py-1 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/70"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(item.id);
                            }}
                            disabled={deletingId === item.id}
                            className="rounded-lg border border-slate-800 px-2 py-1 text-xs font-semibold text-rose-200 transition hover:border-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === item.id ? 'Removing…' : 'Delete'}
                          </button>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-slate-800/70 bg-slate-900/80 p-4 text-sm text-slate-300">
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
