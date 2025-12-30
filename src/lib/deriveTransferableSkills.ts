import type { ImpactInventoryEntry } from '../types/impactInventory';
import type { TransferableSkillsResult } from '../types/transferableSkills';

type TaxonomyItem = {
  skill: string;
  keywords: string[];
};

const TAXONOMY: TaxonomyItem[] = [
  { skill: 'Strategic planning', keywords: ['strategy', 'roadmap', 'vision', 'planning', 'priorit'] },
  { skill: 'Stakeholder management', keywords: ['stakeholder', 'alignment', 'buy-in', 'executive', 'leadership'] },
  { skill: 'Cross-functional collaboration', keywords: ['cross-functional', 'collaborat', 'partner', 'team', 'shared'] },
  { skill: 'Process improvement', keywords: ['process', 'workflow', 'efficiency', 'streamline', 'optimiz'] },
  { skill: 'Project management', keywords: ['project', 'timeline', 'milestone', 'delivery', 'scope'] },
  { skill: 'Data analysis', keywords: ['data', 'insight', 'analytics', 'dashboard', 'metrics'] },
  { skill: 'Customer focus', keywords: ['customer', 'user', 'client', 'experience', 'feedback'] },
  { skill: 'Change management', keywords: ['change', 'adoption', 'enablement', 'training', 'rollout'] },
  { skill: 'Operational execution', keywords: ['operations', 'execution', 'run', 'launch', 'implement'] },
  { skill: 'Communication', keywords: ['communicat', 'present', 'story', 'narrative', 'brief'] }
];

const buildEntryText = (entry: ImpactInventoryEntry) =>
  [
    entry.title,
    entry.company,
    entry.dateRange,
    entry.context,
    entry.actions,
    entry.outcomes,
    entry.metrics,
    entry.tools,
    entry.collaborators,
    entry.skillsUsed
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const buildBullet = (entry: ImpactInventoryEntry) => {
  const fragments = [
    entry.title && `${entry.title}.`,
    entry.actions && `Actions: ${entry.actions}.`,
    entry.outcomes && `Outcome: ${entry.outcomes}.`,
    entry.metrics && `Metrics: ${entry.metrics}.`
  ].filter(Boolean);

  const bullet = fragments.join(' ');
  return bullet.trim();
};

export const deriveTransferableSkills = (impactInventory: ImpactInventoryEntry[]): TransferableSkillsResult => {
  const skillsMap = new Map<string, { count: number; evidence: Set<string> }>();
  const impactBullets = impactInventory
    .map((entry) => buildBullet(entry))
    .filter((bullet) => bullet.length > 0);

  impactInventory.forEach((entry) => {
    const text = buildEntryText(entry);
    if (!text) return;

    TAXONOMY.forEach(({ skill, keywords }) => {
      if (keywords.some((keyword) => text.includes(keyword))) {
        const record = skillsMap.get(skill) ?? { count: 0, evidence: new Set<string>() };
        record.count += 1;
        if (entry.outcomes.trim()) {
          record.evidence.add(entry.outcomes.trim());
        } else if (entry.actions.trim()) {
          record.evidence.add(entry.actions.trim());
        } else if (entry.context.trim()) {
          record.evidence.add(entry.context.trim());
        }
        skillsMap.set(skill, record);
      }
    });
  });

  const transferableSkills = Array.from(skillsMap.entries())
    .map(([skill, { count, evidence }]) => ({
      name: skill,
      evidence: Array.from(evidence).slice(0, 2).join(' | '),
      confidence: Math.min(1, 0.3 + count * 0.2)
    }))
    .sort((a, b) => b.confidence - a.confidence);

  return {
    transferable_skills: transferableSkills,
    impact_bullets: impactBullets
  };
};
