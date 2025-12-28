import type { ApplicationRecord } from '../types/applications';

export const getSuggestedFollowUpDate = (dateApplied: string | null) => {
  if (!dateApplied) return null;
  const applied = new Date(dateApplied);
  if (Number.isNaN(applied.getTime())) return null;
  applied.setDate(applied.getDate() + 10);
  return applied.toISOString().slice(0, 10);
};

export const isFollowUpDue = (application: ApplicationRecord, today = new Date()) => {
  if (!application.date_applied) return false;
  const suggested = getSuggestedFollowUpDate(application.date_applied);
  if (!suggested) return false;
  const suggestedDate = new Date(suggested);
  const nextStepDate = application.next_step_date ? new Date(application.next_step_date) : null;

  if (nextStepDate && nextStepDate >= suggestedDate) {
    return false;
  }

  const normalizedToday = new Date(today.toDateString());
  return suggestedDate <= normalizedToday;
};
