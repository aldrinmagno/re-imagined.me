import { generateApplicationComms } from './applicationCommsGenerator';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const runTests = () => {
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

  assert(payload.email_template.includes('Product Manager'), 'Expected role in email template.');
  assert(payload.linkedin_message.includes('Acme'), 'Expected company in LinkedIn message.');
};

runTests();
