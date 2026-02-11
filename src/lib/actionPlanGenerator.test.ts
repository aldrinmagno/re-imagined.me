import { describe, it, expect } from 'vitest';
import { generateBalancedActionPlan } from './actionPlanGenerator';

describe('generateBalancedActionPlan', () => {
  const plan = generateBalancedActionPlan({
    futureRoles: [],
    roleSkillGroups: [],
    actionPlanPhases: [
      {
        id: 'phase-1',
        title: 'Month 1',
        items: [{ id: '1', title: 'Apply to two roles', estimate: null }]
      }
    ],
    learningResources: [],
    interview: null
  });

  it('generates 12 weeks', () => {
    expect(plan.weeks).toHaveLength(12);
  });

  it('populates application task from phase items', () => {
    expect(plan.weeks[0].tasks.application).toContain('Apply');
  });
});
