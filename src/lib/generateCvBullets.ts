import type { ImpactInventoryEntry } from '../types/impactInventory';
import type { TransferableSkill } from '../types/transferableSkills';
import type { CvBulletsPayload } from '../types/cvBullets';

const getRoleKeywords = (roleTitle: string) =>
  roleTitle
    .split(/\s+/)
    .map((word) => word.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter((word) => word.length > 3);

const buildBulletFromEntry = (entry: ImpactInventoryEntry) => {
  const headline = entry.title || entry.actions || entry.context;
  const fragments = [
    headline ? headline.trim().replace(/\.$/, '') : '',
    entry.outcomes ? `Outcome: ${entry.outcomes.trim()}` : '',
    entry.metrics ? `Impact: ${entry.metrics.trim()}` : ''
  ].filter(Boolean);

  return fragments.join(' — ');
};

const scoreEntry = (entry: ImpactInventoryEntry, roleKeywords: string[], skillNames: string[]) => {
  const haystack = [
    entry.title,
    entry.context,
    entry.actions,
    entry.outcomes,
    entry.metrics,
    entry.skillsUsed
  ]
    .join(' ')
    .toLowerCase();

  const keywordHits = roleKeywords.filter((keyword) => haystack.includes(keyword)).length;
  const skillHits = skillNames.filter((skill) => haystack.includes(skill.toLowerCase())).length;
  const metricsBonus = entry.metrics.trim() ? 1 : 0;

  return keywordHits * 2 + skillHits + metricsBonus;
};

const buildSkillBullet = (skill: TransferableSkill) => {
  const evidence = skill.evidence ? ` using ${skill.evidence}` : '';
  return `Applied ${skill.name.toLowerCase()}${evidence} to drive measurable results.`;
};

export const generateCvBullets = ({
  roleTitle,
  impactInventory,
  transferableSkills
}: {
  roleTitle: string;
  impactInventory: ImpactInventoryEntry[];
  transferableSkills: TransferableSkill[];
}): CvBulletsPayload => {
  const roleKeywords = getRoleKeywords(roleTitle);
  const skillNames = transferableSkills.map((skill) => skill.name);

  const scoredEntries = impactInventory
    .map((entry) => ({
      entry,
      score: scoreEntry(entry, roleKeywords, skillNames),
      bullet: buildBulletFromEntry(entry)
    }))
    .filter((item) => item.bullet.length > 0)
    .sort((a, b) => b.score - a.score);

  const mostRelevant: string[] = [];
  const supporting: string[] = [];

  scoredEntries.forEach((item, index) => {
    if (index < 6) {
      mostRelevant.push(item.bullet);
    } else {
      supporting.push(item.bullet);
    }
  });

  const skillBullets = transferableSkills.slice(0, 4).map(buildSkillBullet);
  while (mostRelevant.length + supporting.length < 8 && skillBullets.length > 0) {
    const bullet = skillBullets.shift();
    if (bullet) {
      supporting.push(bullet);
    }
  }

  const total = mostRelevant.length + supporting.length;
  if (total > 12) {
    const overflow = total - 12;
    supporting.splice(Math.max(0, supporting.length - overflow), overflow);
  }

  return {
    mostRelevant,
    supporting
  };
};
