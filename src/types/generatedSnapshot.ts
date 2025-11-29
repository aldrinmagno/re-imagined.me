export interface GeneratedSnapshot {
  reportTitle: string;
  reportSummary: string;
  strengthsSnapshot: {
    summary: string;
    themes: string[];
    workStyle: string[];
  };
  whereYouAre: {
    summary: string;
    highlights: string[];
  };
  headlineSuggestion: string;
  interviewOverview: string;
  linkedinHeadline: string;
  futureRoles: {
    title: string;
    description: string;
    reasons: string[];
    skills: {
      name: string;
      summary: string;
      category: string;
    }[];
    plan: {
      monthLabel: string;
      title: string;
      description: string;
      actions: {
        label: string;
        timePerWeek: string;
      }[];
    }[];
    learningResources: {
      title: string;
      description: string;
      url: string;
      tags: string[];
    }[];
  }[];
  generalLearningResources: {
    title: string;
    description: string;
    url: string;
    tags: string[];
  }[];
  interview: {
    headline: string;
    howToDescribe: string;
    talkingPoints: string[];
    linkedinHeadline: string;
  };
}

const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');

export const validateGeneratedSnapshot = (value: unknown): value is GeneratedSnapshot => {
  if (!value || typeof value !== 'object') return false;
  const snapshot = value as Record<string, unknown>;

  const requiredStrings = ['reportTitle', 'reportSummary', 'headlineSuggestion', 'interviewOverview', 'linkedinHeadline'];
  if (!requiredStrings.every((key) => typeof snapshot[key] === 'string' && (snapshot[key] as string).trim())) return false;

  const strengths = snapshot.strengthsSnapshot as Record<string, unknown> | undefined;
  if (!strengths || typeof strengths !== 'object') return false;
  if (typeof strengths.summary !== 'string' || !isStringArray(strengths.themes) || !isStringArray(strengths.workStyle)) return false;

  const whereYouAre = snapshot.whereYouAre as Record<string, unknown> | undefined;
  if (!whereYouAre || typeof whereYouAre !== 'object') return false;
  if (typeof whereYouAre.summary !== 'string' || !isStringArray(whereYouAre.highlights)) return false;

  if (!Array.isArray(snapshot.futureRoles) || snapshot.futureRoles.length === 0) return false;

  for (const role of snapshot.futureRoles as unknown[]) {
    if (!role || typeof role !== 'object') return false;
    const roleObj = role as Record<string, unknown>;
    if (typeof roleObj.title !== 'string' || typeof roleObj.description !== 'string') return false;
    if (!isStringArray(roleObj.reasons) || roleObj.reasons.length < 2) return false;

    if (!Array.isArray(roleObj.skills) || roleObj.skills.length === 0) return false;
    for (const skill of roleObj.skills as unknown[]) {
      if (!skill || typeof skill !== 'object') return false;
      const skillObj = skill as Record<string, unknown>;
      if (typeof skillObj.name !== 'string' || typeof skillObj.summary !== 'string' || typeof skillObj.category !== 'string') return false;
    }

    if (!Array.isArray(roleObj.plan) || roleObj.plan.length === 0) return false;
    for (const phase of roleObj.plan as unknown[]) {
      if (!phase || typeof phase !== 'object') return false;
      const phaseObj = phase as Record<string, unknown>;
      if (typeof phaseObj.monthLabel !== 'string' || typeof phaseObj.title !== 'string' || typeof phaseObj.description !== 'string') return false;
      if (!Array.isArray(phaseObj.actions) || phaseObj.actions.length === 0) return false;
      for (const action of phaseObj.actions as unknown[]) {
        if (!action || typeof action !== 'object') return false;
        const actionObj = action as Record<string, unknown>;
        if (typeof actionObj.label !== 'string' || typeof actionObj.timePerWeek !== 'string') return false;
      }
    }

    if (!Array.isArray(roleObj.learningResources)) return false;
    for (const resource of roleObj.learningResources as unknown[]) {
      if (!resource || typeof resource !== 'object') return false;
      const resourceObj = resource as Record<string, unknown>;
      if (typeof resourceObj.title !== 'string' || typeof resourceObj.description !== 'string' || typeof resourceObj.url !== 'string')
        return false;
      if (!isStringArray(resourceObj.tags ?? [])) return false;
    }
  }

  if (!Array.isArray(snapshot.generalLearningResources)) return false;
  for (const resource of snapshot.generalLearningResources as unknown[]) {
    if (!resource || typeof resource !== 'object') return false;
    const resourceObj = resource as Record<string, unknown>;
    if (typeof resourceObj.title !== 'string' || typeof resourceObj.description !== 'string' || typeof resourceObj.url !== 'string')
      return false;
    if (!isStringArray(resourceObj.tags ?? [])) return false;
  }

  const interview = snapshot.interview as Record<string, unknown> | undefined;
  if (!interview || typeof interview !== 'object') return false;
  if (
    typeof interview.headline !== 'string' ||
    typeof interview.howToDescribe !== 'string' ||
    typeof interview.linkedinHeadline !== 'string' ||
    !isStringArray(interview.talkingPoints) ||
    interview.talkingPoints.length === 0
  ) {
    return false;
  }

  return true;
};
