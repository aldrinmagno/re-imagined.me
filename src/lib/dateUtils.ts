/**
 * Format an ISO date string as a locale date (date only).
 * Returns the fallback string when the value is absent or unparseable.
 */
export const formatDate = (value?: string | null, fallback = '—'): string => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString();
};

/**
 * Format an ISO date string as a locale date-time (date + time).
 * Returns the fallback string when the value is absent or unparseable.
 */
export const formatDateTime = (value?: string | null, fallback = 'Not saved yet'): string => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString();
};
