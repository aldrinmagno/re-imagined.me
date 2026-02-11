import { describe, it, expect } from 'vitest';
import { generateApplicationComms } from './applicationCommsGenerator';

describe('generateApplicationComms', () => {
  const payload = generateApplicationComms(
    {
      id: '1',
      user_id: 'user',
      company: 'Acme',
      role_title: 'Product Manager',
      source: null,
      date_applied: '2025-01-01',
      status: 'applied',
      contact: 'Jamie',
      notes: null,
      next_step: null,
      next_step_date: null,
      updated_at: '2025-01-02'
    },
    'direct'
  );

  it('includes role in email template', () => {
    expect(payload.email_template).toContain('Product Manager');
  });

  it('includes company in LinkedIn message', () => {
    expect(payload.linkedin_message).toContain('Acme');
  });
});
