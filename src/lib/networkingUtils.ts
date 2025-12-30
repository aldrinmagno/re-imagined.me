import type { NetworkContactRecord, NetworkTaskRecord } from '../types/networking';

export const buildTemplate = (template: string, contact?: NetworkContactRecord | null) => {
  if (!contact) return template;
  return template
    .replace('{name}', contact.name)
    .replace('{org}', contact.org ?? '')
    .replace('{role}', contact.role ?? '');
};

export const getContactLabel = (contact?: NetworkContactRecord | null) => {
  if (!contact) return 'No contact';
  const parts = [contact.name, contact.org].filter(Boolean);
  return parts.join(' · ');
};

export const sortTasksByDueDate = (tasks: NetworkTaskRecord[]) => {
  return [...tasks].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });
};
