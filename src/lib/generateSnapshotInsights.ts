import type { AssessmentFormData, SnapshotInsights } from '../types/assessment';

interface SnapshotInput {
  formData: AssessmentFormData;
  goalText: string;
  industryLabels?: string[];
}

const formatIndustries = (industries?: string[]) =>
  industries && industries.length > 0 ? industries.join(', ') : null;

const formatStrengths = (strengths?: string[]) =>
  strengths && strengths.length > 0 ? strengths.join(', ') : null;

const buildStructuredSignals = (input: SnapshotInput) => {
  const trimmedOther = input.formData.strengthsOther?.trim();

  return {
    jobTitle: input.formData.jobTitle || null,
    industries: input.industryLabels ?? [],
    yearsExperience: input.formData.yearsExperience || null,
    lookingFor: input.formData.lookingFor || null,
    strengths: input.formData.strengths ?? [],
    strengthsOther: trimmedOther ? trimmedOther : null,
    workPreferences: input.formData.workPreferences || null,
    typicalWeek: input.formData.typicalWeek || null
  };
};

const createFallbackInsights = ({
  formData,
  goalText,
  industryLabels
}: SnapshotInput): SnapshotInsights => {
  const industryText = formatIndustries(industryLabels) ?? 'your space';
  const strengthsText = formatStrengths(formData.strengths) ?? 'core capabilities';

  return {
    workEvolution:
      `Expect the ${formData.jobTitle || 'role'} in ${industryText} to lean more on judgement, partner communication, and orchestration as automation absorbs the repetitive pieces of your workflow.`,
    futureDirections:
      `Blend your strengths in ${strengthsText} with ${goalText} to explore adjacent roles that translate your domain knowledge into higher-leverage work.`,
    nextSteps:
      'Focus your next 90 days on clarifying outcomes, upskilling in AI-enabled tooling, and piloting a project that showcases how you solve emerging problems.'
  };
};

const parseInsightsFromContent = (content: string): SnapshotInsights | null => {
  if (!content) {
    return null;
  }

  try {
    const parsed = JSON.parse(content.trim());
    if (
      parsed &&
      typeof parsed.workEvolution === 'string' &&
      typeof parsed.futureDirections === 'string' &&
      typeof parsed.nextSteps === 'string'
    ) {
      return {
        workEvolution: parsed.workEvolution.trim(),
        futureDirections: parsed.futureDirections.trim(),
        nextSteps: parsed.nextSteps.trim()
      };
    }
  } catch (error) {
    console.warn('Failed to parse snapshot insights JSON', error);
  }

  return null;
};

export const generateSnapshotInsights = async (input: SnapshotInput): Promise<SnapshotInsights> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const structuredSignals = buildStructuredSignals(input);

  if (!apiKey) {
    console.warn('Missing OpenAI API key; using fallback snapshot insights.');
    return createFallbackInsights(input);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              'You are a concise career strategist. Return JSON only with keys workEvolution, futureDirections, nextSteps. Each value must be no more than 60 words.'
          },
          {
            role: 'user',
            content: `Structured signals for analytics and recommendations: ${JSON.stringify(structuredSignals)}`
          },
          {
            role: 'user',
            content: `Create a short snapshot for someone currently working as ${input.formData.jobTitle || 'a professional'} in ${
              formatIndustries(input.industryLabels) ?? 'their industry'
            }. They are looking to ${input.goalText}. Their key strengths are ${
              formatStrengths(input.formData.strengths) ?? 'not specified'
            } and their work preferences include ${
              input.formData.workPreferences || 'not specified'
            }. Include nods to how their typical work may evolve (${input.formData.typicalWeek || 'no rhythm provided'}).`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data?.choices?.[0]?.message?.content;
    const parsed = parseInsightsFromContent(aiContent);

    if (parsed) {
      return parsed;
    }

    return createFallbackInsights(input);
  } catch (error) {
    console.error('Error generating snapshot insights', error);
    return createFallbackInsights(input);
  }
};
