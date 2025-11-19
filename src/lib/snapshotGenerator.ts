import type { AssessmentFormData } from '../types/assessment';

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

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';

async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key is not configured.');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.4,
      max_tokens: 250,
      messages: [
        {
          role: 'system',
          content:
            'You are a concise career strategist. Reply with friendly, forward-looking, plain-language insights that fit comfortably inside a short paragraph or compact list.'
        },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const message = errorPayload?.error?.message || 'Failed to generate an AI snapshot.';
    throw new Error(message);
  }

  const data = await response.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('The AI response was empty.');
  }

  return content.trim();
}

export async function generateSnapshotSections(prompts: SnapshotPrompts): Promise<SnapshotResponses> {
  const entries = Object.entries(prompts) as [keyof SnapshotPrompts, string][];
  const results: Partial<SnapshotResponses> = {};

  for (const [key, prompt] of entries) {
    // Sequential calls keep token usage predictable and let us persist each prompt separately.
    const response = await callOpenAI(prompt);
    results[key] = response;
  }

  return results as SnapshotResponses;
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
