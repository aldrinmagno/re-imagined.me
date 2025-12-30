import type { RadarItemRecord, RadarItemStatus, RadarItemType } from '../types/radar';

export type RadarFilters = {
  query: string;
  status: 'all' | RadarItemStatus;
  priority: 'all' | 1 | 2 | 3;
  type: RadarItemType;
};

export const filterRadarItems = (items: RadarItemRecord[], filters: RadarFilters) => {
  const query = filters.query.trim().toLowerCase();

  return items.filter((item) => {
    if (item.type !== filters.type) return false;
    if (filters.status !== 'all' && item.status !== filters.status) return false;
    if (filters.priority !== 'all' && item.priority !== filters.priority) return false;
    if (query) {
      const haystack = [item.name, item.link ?? '', item.meta.fit_notes, item.meta.tags.join(' ')].join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
};
