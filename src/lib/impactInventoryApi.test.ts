import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getImpactInventory, getImpactInventoryEntries, saveImpactInventory } from './impactInventoryApi';

function createQueryMock(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.upsert = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.maybeSingle = vi.fn().mockResolvedValue(result);
  chain.single = vi.fn().mockResolvedValue(result);
  chain.then = (resolve: (v: unknown) => void) => Promise.resolve(result).then(resolve);
  return { from: vi.fn().mockReturnValue(chain), _chain: chain };
}

vi.mock('./supabaseClient', () => ({
  getSupabaseClient: vi.fn()
}));

import { getSupabaseClient } from './supabaseClient';
const mockGetClient = vi.mocked(getSupabaseClient);

describe('impactInventoryApi', () => {
  const userId = 'user-abc';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getImpactInventory', () => {
    it('returns the full inventory record for a user', async () => {
      const record = { id: '1', user_id: userId, entries: [], include_in_report: true, updated_at: '2025-01-01' };
      const mock = createQueryMock({ data: record, error: null });
      mockGetClient.mockReturnValue(mock as never);

      const result = await getImpactInventory(userId);

      expect(mock.from).toHaveBeenCalledWith('impact_inventory');
      expect(mock._chain.select).toHaveBeenCalledWith('*');
      expect(mock._chain.eq).toHaveBeenCalledWith('user_id', userId);
      expect(result).toEqual(record);
    });

    it('returns null when no inventory exists', async () => {
      const mock = createQueryMock({ data: null, error: null });
      mockGetClient.mockReturnValue(mock as never);

      const result = await getImpactInventory(userId);
      expect(result).toBeNull();
    });

    it('throws on Supabase error', async () => {
      const mock = createQueryMock({ data: null, error: { message: 'Permission denied' } });
      mockGetClient.mockReturnValue(mock as never);

      await expect(getImpactInventory(userId)).rejects.toThrow('Permission denied');
    });
  });

  describe('getImpactInventoryEntries', () => {
    it('returns entries and include_in_report flag', async () => {
      const data = { entries: [{ role: 'Dev', achievement: 'Built API' }], include_in_report: true };
      const mock = createQueryMock({ data, error: null });
      mockGetClient.mockReturnValue(mock as never);

      const result = await getImpactInventoryEntries(userId);

      expect(mock._chain.select).toHaveBeenCalledWith('entries, include_in_report');
      expect(result).toEqual(data);
    });

    it('returns null when no entries exist', async () => {
      const mock = createQueryMock({ data: null, error: null });
      mockGetClient.mockReturnValue(mock as never);

      const result = await getImpactInventoryEntries(userId);
      expect(result).toBeNull();
    });
  });

  describe('saveImpactInventory', () => {
    it('upserts entries and returns updated_at', async () => {
      const mock = createQueryMock({ data: { updated_at: '2025-06-01T12:00:00Z' }, error: null });
      mockGetClient.mockReturnValue(mock as never);

      const entries = [{ role: 'Dev', achievement: 'Shipped v2' }];
      const result = await saveImpactInventory(userId, entries as never, true);

      expect(mock._chain.upsert).toHaveBeenCalledWith(
        { user_id: userId, entries, include_in_report: true },
        { onConflict: 'user_id' }
      );
      expect(mock._chain.select).toHaveBeenCalledWith('updated_at');
      expect(result).toEqual({ updated_at: '2025-06-01T12:00:00Z' });
    });

    it('throws on Supabase error', async () => {
      const mock = createQueryMock({ data: null, error: { message: 'Upsert failed' } });
      mockGetClient.mockReturnValue(mock as never);

      await expect(saveImpactInventory(userId, [], false)).rejects.toThrow('Upsert failed');
    });
  });
});
