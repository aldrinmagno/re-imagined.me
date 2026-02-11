import { describe, it, expect, vi, beforeEach } from 'vitest';
import { insertAssessmentResponse, attachSnapshotInsights, getLatestAssessment } from './assessmentApi';
import type { SnapshotInsights } from '../types/assessment';

function createQueryMock(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);
  chain.maybeSingle = vi.fn().mockResolvedValue(result);
  chain.then = (resolve: (v: unknown) => void) => Promise.resolve(result).then(resolve);
  return { from: vi.fn().mockReturnValue(chain), _chain: chain };
}

vi.mock('./supabaseClient', () => ({
  getSupabaseClient: vi.fn()
}));

import { getSupabaseClient } from './supabaseClient';
const mockGetClient = vi.mocked(getSupabaseClient);

describe('assessmentApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('insertAssessmentResponse', () => {
    const payload = {
      jobTitle: 'Engineer',
      industry: ['tech'],
      yearsExperience: 5,
      strengths: '["problem-solving"]',
      typicalWeek: 'coding',
      lookingFor: '["growth"]',
      transitionTarget: null,
      workPreferences: null,
      email: 'test@example.com',
      fullName: 'Test User',
      userId: 'user-1'
    };

    it('inserts the assessment and returns the id', async () => {
      const mock = createQueryMock({ data: { id: 'assessment-1' }, error: null });
      mockGetClient.mockReturnValue(mock as never);

      const result = await insertAssessmentResponse(payload);

      expect(mock.from).toHaveBeenCalledWith('assessment_responses');
      expect(mock._chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          job_title: 'Engineer',
          industry: ['tech'],
          years_experience: 5,
          email: 'test@example.com',
          user_id: 'user-1'
        })
      );
      expect(result).toEqual({ id: 'assessment-1' });
    });

    it('throws on Supabase error', async () => {
      const mock = createQueryMock({ data: null, error: { message: 'Insert failed' } });
      mockGetClient.mockReturnValue(mock as never);

      await expect(insertAssessmentResponse(payload)).rejects.toThrow('Insert failed');
    });
  });

  describe('attachSnapshotInsights', () => {
    it('updates snapshot_insights on the assessment row', async () => {
      const insights = { headline: 'Great match' } as unknown as SnapshotInsights;
      const mock = createQueryMock({ data: null, error: null });
      // attachSnapshotInsights doesn't call .single(), it resolves from .eq()
      mockGetClient.mockReturnValue(mock as never);

      await attachSnapshotInsights('assessment-1', insights);

      expect(mock.from).toHaveBeenCalledWith('assessment_responses');
      expect(mock._chain.update).toHaveBeenCalledWith({ snapshot_insights: insights });
      expect(mock._chain.eq).toHaveBeenCalledWith('id', 'assessment-1');
    });

    it('throws on Supabase error', async () => {
      const mock = createQueryMock({ data: null, error: { message: 'Update failed' } });
      mockGetClient.mockReturnValue(mock as never);

      await expect(
        attachSnapshotInsights('assessment-1', {} as SnapshotInsights)
      ).rejects.toThrow('Update failed');
    });
  });

  describe('getLatestAssessment', () => {
    const assessmentRow = {
      id: 'a-1',
      job_title: 'Engineer',
      industry: ['tech'],
      years_experience: 5,
      strengths: '["problem-solving"]',
      typical_week: null,
      looking_for: '["growth"]',
      transition_target: null,
      work_preferences: null,
      email: 'test@example.com',
      full_name: 'Test User',
      snapshot_insights: null,
      submitted_at: '2025-01-01T00:00:00Z'
    };

    it('returns the latest assessment by user_id', async () => {
      const mock = createQueryMock({ data: assessmentRow, error: null });
      mockGetClient.mockReturnValue(mock as never);

      const result = await getLatestAssessment('user-1');

      expect(mock._chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mock._chain.order).toHaveBeenCalledWith('submitted_at', { ascending: false });
      expect(mock._chain.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual(assessmentRow);
    });

    it('returns null when no assessment exists and no fallback email', async () => {
      const mock = createQueryMock({ data: null, error: null });
      mockGetClient.mockReturnValue(mock as never);

      const result = await getLatestAssessment('user-1');
      expect(result).toBeNull();
    });

    it('falls back to email lookup when user_id returns nothing', async () => {
      // First call (by user_id) returns null, second call (by email) returns data
      const primaryMock = createQueryMock({ data: null, error: null });
      const fallbackMock = createQueryMock({ data: assessmentRow, error: null });

      let callCount = 0;
      const from = vi.fn().mockImplementation(() => {
        callCount++;
        return callCount === 1 ? primaryMock._chain : fallbackMock._chain;
      });
      mockGetClient.mockReturnValue({ from } as never);

      const result = await getLatestAssessment('user-1', 'test@example.com');

      expect(from).toHaveBeenCalledTimes(2);
      expect(fallbackMock._chain.eq).toHaveBeenCalledWith('email', 'test@example.com');
      expect(result).toEqual(assessmentRow);
    });

    it('throws on Supabase error', async () => {
      const mock = createQueryMock({ data: null, error: { message: 'Query timeout' } });
      mockGetClient.mockReturnValue(mock as never);

      await expect(getLatestAssessment('user-1')).rejects.toThrow('Query timeout');
    });
  });
});
