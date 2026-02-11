import { describe, it, expect } from 'vitest';
import { getSuggestedFollowUpDate, isFollowUpDue } from './applicationUtils';

describe('applicationUtils', () => {
  it('suggests follow-up date 10 days later', () => {
    expect(getSuggestedFollowUpDate('2025-01-01')).toBe('2025-01-11');
  });

  it('marks follow-up as due after 10 days', () => {
    const due = isFollowUpDue(
      {
        id: '1',
        user_id: 'user',
        company: 'Acme',
        role_title: 'PM',
        source: null,
        date_applied: '2025-01-01',
        status: 'applied',
        contact: null,
        notes: null,
        next_step: null,
        next_step_date: null,
        updated_at: '2025-01-02'
      },
      new Date('2025-01-20')
    );
    expect(due).toBe(true);
  });
});
