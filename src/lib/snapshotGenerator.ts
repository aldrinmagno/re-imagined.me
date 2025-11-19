import type { AssessmentFormData } from '../types/assessment';
import { getSupabaseClient } from './supabaseClient';

export interface SnapshotPrompts {
  howYourWorkMayEvolve: string;
  potentialFutureDirections: string;
  structuredNextSteps: string;
}

export interface SnapshotResponses {
  howYourWorkMayEvolve: string;
  potentialFutureDirections: string;
  structuredNextSteps: string;
}

export async function generateSnapshotSections(prompts: SnapshotPrompts): Promise<SnapshotResponses> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke<SnapshotResponses>('generate-snapshot', {
    body: {
      sections: prompts
    }
  });

  if (error) {
    throw new Error(error.message || 'Failed to generate an AI snapshot.');
  }

  if (!data) {
    throw new Error('Snapshot data was not returned by the server.');
  }

  return data;
}

export function buildSnapshotPrompts(
  formData: AssessmentFormData,
  goalText: string,
  industryLabel: string
): SnapshotPrompts {
  const safe = (value: string, fallback: string) => value?.trim() || fallback;

  const baseSummary = `Professional snapshot:\n- Job title: ${safe(formData.jobTitle, 'Not specified')}\n- Industry: ${safe(industryLabel || formData.industry, 'Not specified')}\n- Years of experience: ${safe(formData.yearsExperience, 'Not specified')}\n- Strengths: ${safe(formData.strengths, 'Not specified')}\n- Typical week: ${safe(formData.typicalWeek, 'Not provided')}\n- Primary goal: ${safe(goalText, 'Not specified')}\n- Work preferences: ${safe(formData.workPreferences, 'Not provided')}`;

  return {
    howYourWorkMayEvolve: `${baseSummary}\n\nIn 2 short sentences (max 55 words), describe how their work might evolve over the next few years as AI adoption accelerates. Reference their goal only if it adds clarity.`,
    potentialFutureDirections: `${baseSummary}\n\nList 2 potential future directions or roles that would stay relevant for them. Each direction should be a single sentence under 30 words that highlights why it fits.`,
    structuredNextSteps: `${baseSummary}\n\nProvide a numbered list of 3 practical next steps they can take in the next 90 days to progress toward their goal. Each step should be fewer than 16 words.`
  };
}
