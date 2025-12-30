import { getSuggestedFollowUpDate, isFollowUpDue } from './applicationUtils';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const runTests = () => {
  const followUp = getSuggestedFollowUpDate('2025-01-01');
  assert(followUp === '2025-01-11', 'Expected follow-up date to be 10 days later.');

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
  assert(due, 'Expected follow-up to be due after 10 days.');
};

runTests();
