import { generateCvBullets } from './generateCvBullets';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const runTests = () => {
  const result = generateCvBullets({
    roleTitle: 'Product Manager',
    impactInventory: [
      {
        id: 'entry-1',
        title: 'Launch onboarding revamp',
        company: 'Acme',
        dateRange: '2022',
        context: 'High churn',
        actions: 'Led cross-functional squad to redesign onboarding flows',
        outcomes: 'Reduced churn and improved activation',
        metrics: 'Activation +15%',
        tools: '',
        collaborators: '',
        skillsUsed: 'Product strategy, experimentation'
      }
    ],
    transferableSkills: [{ name: 'Strategic planning', evidence: 'Roadmap definition', confidence: 0.8 }]
  });

  assert(result.mostRelevant.length + result.supporting.length >= 1, 'Expected generated bullets.');
  assert(result.mostRelevant.length <= 6, 'Expected most relevant bullets to be capped.');
};

runTests();
