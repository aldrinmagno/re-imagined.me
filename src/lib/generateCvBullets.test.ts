import { describe, it, expect } from 'vitest';
import { generateCvBullets } from './generateCvBullets';

describe('generateCvBullets', () => {
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

  it('generates at least one bullet', () => {
    expect(result.mostRelevant.length + result.supporting.length).toBeGreaterThanOrEqual(1);
  });

  it('caps most relevant bullets at 6', () => {
    expect(result.mostRelevant.length).toBeLessThanOrEqual(6);
  });
});
