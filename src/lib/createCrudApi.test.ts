import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCrudApi } from './createCrudApi';

type TestRecord = {
  id: string;
  user_id: string;
  updated_at: string;
  name: string;
  value: number;
};

// Chainable mock builder for the Supabase query interface
function createQueryMock(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.delete = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.returns = vi.fn().mockResolvedValue(result);
  chain.single = vi.fn().mockResolvedValue(result);
  chain.then = (resolve: (v: unknown) => void) => Promise.resolve(result).then(resolve);
  return { from: vi.fn().mockReturnValue(chain), _chain: chain };
}

vi.mock('./supabaseClient', () => ({
  getSupabaseClient: vi.fn()
}));

import { getSupabaseClient } from './supabaseClient';
const mockGetClient = vi.mocked(getSupabaseClient);

describe('createCrudApi', () => {
  const userId = 'user-123';
  let api: ReturnType<typeof createCrudApi<TestRecord>>;

  beforeEach(() => {
    vi.clearAllMocks();
    api = createCrudApi<TestRecord>('test_table');
  });

  describe('getAll', () => {
    it('returns rows filtered by user_id', async () => {
      const rows: TestRecord[] = [
        { id: '1', user_id: userId, updated_at: '2025-01-01', name: 'A', value: 10 }
      ];
      const mock = createQueryMock({ data: rows, error: null });
      mockGetClient.mockReturnValue(mock as never);

      const result = await api.getAll(userId);

      expect(mock.from).toHaveBeenCalledWith('test_table');
      expect(mock._chain.select).toHaveBeenCalledWith('*');
      expect(mock._chain.eq).toHaveBeenCalledWith('user_id', userId);
      expect(mock._chain.order).toHaveBeenCalledWith('updated_at', { ascending: false });
      expect(result).toEqual(rows);
    });

    it('returns empty array when data is null', async () => {
      const mock = createQueryMock({ data: null, error: null });
      mockGetClient.mockReturnValue(mock as never);

      const result = await api.getAll(userId);
      expect(result).toEqual([]);
    });

    it('throws on Supabase error', async () => {
      const mock = createQueryMock({ data: null, error: { message: 'DB connection lost' } });
      mockGetClient.mockReturnValue(mock as never);

      await expect(api.getAll(userId)).rejects.toThrow('DB connection lost');
    });
  });

  describe('create', () => {
    it('inserts a row with user_id and returns it', async () => {
      const created: TestRecord = { id: '2', user_id: userId, updated_at: '2025-01-02', name: 'B', value: 20 };
      const mock = createQueryMock({ data: created, error: null });
      mockGetClient.mockReturnValue(mock as never);

      const result = await api.create(userId, { name: 'B', value: 20 });

      expect(mock._chain.insert).toHaveBeenCalledWith({ name: 'B', value: 20, user_id: userId });
      expect(mock._chain.select).toHaveBeenCalledWith('*');
      expect(result).toEqual(created);
    });

    it('throws on Supabase error', async () => {
      const mock = createQueryMock({ data: null, error: { message: 'Duplicate key' } });
      mockGetClient.mockReturnValue(mock as never);

      await expect(api.create(userId, { name: 'B', value: 20 })).rejects.toThrow('Duplicate key');
    });
  });

  describe('update', () => {
    it('updates a row scoped by id and user_id', async () => {
      const updated: TestRecord = { id: '1', user_id: userId, updated_at: '2025-01-03', name: 'A+', value: 15 };
      const mock = createQueryMock({ data: updated, error: null });
      mockGetClient.mockReturnValue(mock as never);

      const result = await api.update(userId, '1', { name: 'A+' });

      expect(mock._chain.update).toHaveBeenCalledWith({ name: 'A+' });
      expect(mock._chain.eq).toHaveBeenCalledWith('id', '1');
      expect(mock._chain.eq).toHaveBeenCalledWith('user_id', userId);
      expect(result).toEqual(updated);
    });

    it('throws on Supabase error', async () => {
      const mock = createQueryMock({ data: null, error: { message: 'Not found' } });
      mockGetClient.mockReturnValue(mock as never);

      await expect(api.update(userId, '1', { name: 'fail' })).rejects.toThrow('Not found');
    });
  });

  describe('remove', () => {
    it('deletes a row scoped by id and user_id', async () => {
      const mock = createQueryMock({ data: null, error: null });
      // For delete, the chain resolves directly (no .single())
      mockGetClient.mockReturnValue(mock as never);

      await api.remove(userId, '1');

      expect(mock._chain.delete).toHaveBeenCalled();
      expect(mock._chain.eq).toHaveBeenCalledWith('id', '1');
      expect(mock._chain.eq).toHaveBeenCalledWith('user_id', userId);
    });

    it('throws on Supabase error', async () => {
      const mock = createQueryMock({ data: null, error: { message: 'FK constraint' } });
      mockGetClient.mockReturnValue(mock as never);

      await expect(api.remove(userId, '1')).rejects.toThrow('FK constraint');
    });
  });
});
