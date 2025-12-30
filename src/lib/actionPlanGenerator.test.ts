import { generateBalancedActionPlan } from './actionPlanGenerator';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const runTests = () => {
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

  assert(plan.weeks.length === 12, 'Expected 12 weeks in plan.');
  assert(plan.weeks[0].tasks.application.includes('Apply'), 'Expected application task populated.');
};

runTests();
