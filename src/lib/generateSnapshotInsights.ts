import { getSupabaseClient } from './supabaseClient';
import type { AssessmentFormData, SnapshotInsights } from '../types/assessment';
import type { GeneratedSnapshot } from '../types/generatedSnapshot';
import { validateGeneratedSnapshot } from '../types/generatedSnapshot';

interface SnapshotInput {
  formData: AssessmentFormData;
  goalText: string;
  industryLabels?: string[];
  assessmentId?: string;
}

const fallbackFutureRoles: SnapshotInsights['futureRoles'] = [
  {
    title: 'AI-Augmented Program Manager',
    reasons: [
      'Blends your delivery discipline with lightweight automation.',
      'Keeps you close to cross-functional teams without heavy coding.'
    ]
  },
  {
    title: 'Product Operations Lead',
    reasons: [
      'Translates product strategy into repeatable rituals.',
      'Plays to your strength in coordinating people, processes, and data.'
    ]
  },
  {
    title: 'Customer Success Strategist',
    reasons: [
      'Uses your stakeholder empathy to shape retention and renewals.',
      'Pairs well with your project background for structured improvements.'
    ]
  }
];

const fallbackSkillsByRole: SnapshotInsights['skillsByRole'] = [
  {
    role: 'AI-Augmented Program Manager',
    skills: ['Workflow automation basics', 'Prompt design for internal tools', 'Risk and change communication']
  },
  {
    role: 'Product Operations Lead',
    skills: ['Metrics storytelling', 'Experiment ops', 'Lightweight process design']
  },
  {
    role: 'Customer Success Strategist',
    skills: ['Voice-of-customer analysis', 'Success playbooks', 'Executive-ready reporting']
  }
];

const fallbackActionPlan: SnapshotInsights['actionPlan'] = [
  {
    phase: 'Month 1 — Map and measure',
    items: [
      'Audit your current projects for repeatable workflows you can automate.',
      'Shadow a product manager to capture their weekly rituals and metrics.',
      'Host two customer calls focused on goals, not features.'
    ]
  },
  {
    phase: 'Month 2 — Prototype and practice',
    items: [
      'Build a simple automation (e.g., status summaries) using AI-assisted tools.',
      'Draft a lightweight product ops cadence for one team.',
      'Create a success playbook outline based on the customer calls.'
    ]
  },
  {
    phase: 'Month 3 — Ship and socialize',
    items: [
      'Roll out the automation to your squad with clear guardrails.',
      'Share a metrics snapshot and facilitation plan with product leadership.',
      'Pilot the success playbook with two accounts and gather feedback.'
    ]
  }
];

const fallbackLearningResources: SnapshotInsights['learningResources'] = [
  { label: 'Automation mini-course (no-code)', href: '#' },
  { label: 'Product ops rituals template', href: '#' },
  { label: 'Customer interview guide', href: '#' },
  { label: 'Intro to prompt design for ops', href: '#' }
];

const fallbackInterviewTalkingPoints: SnapshotInsights['interviewTalkingPoints'] = [
  'Link AI experimentation to measurable delivery wins.',
  'Show how you translate ambiguity into weekly rituals and checkpoints.',
  'Highlight your ability to calm stakeholders during change.',
  'Emphasize curiosity about tools while keeping people at the center.',
  'Share a story where you turned feedback into a repeatable playbook.'
];

const formatStrengths = (strengths?: string[]) =>
  strengths && strengths.length > 0 ? strengths.join(', ') : null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const sanitizeStringArray = (value: unknown): string[] =>
  isStringArray(value) ? value.map((item) => item.trim()).filter(Boolean) : [];

const normalizeLookingFor = (value: AssessmentFormData['lookingFor']) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value) {
    return [value];
  }

  return [];
};

const safeRandomId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `act_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const buildStructuredSignals = (input: SnapshotInput) => {
  const trimmedOther = input.formData.strengthsOther?.trim();

  return {
    jobTitle: input.formData.jobTitle || null,
    industries: input.industryLabels ?? [],
    yearsExperience: input.formData.yearsExperience || null,
    lookingFor: normalizeLookingFor(input.formData.lookingFor),
    transitionTarget: input.formData.transitionTarget?.trim() || null,
    strengths: input.formData.strengths ?? [],
    strengthsOther: trimmedOther || null,
    typicalWeek: input.formData.typicalWeek || null,
    workPreferences: input.formData.workPreferences || null,
    goalText: input.goalText
  };
};

const createFallbackGeneratedSnapshot = (input: SnapshotInput): GeneratedSnapshot => {
  const jobTitle = input.formData.jobTitle || 'your role';
  const strengthsText = formatStrengths(input.formData.strengths) ?? 'your strengths';

  const roleSkills = new Map<string, string[]>(fallbackSkillsByRole.map((entry) => [entry.role, entry.skills]));

  return {
    reportTitle: `${jobTitle} — 90-day roadmap`,
    reportSummary:
      'You are positioned to translate your current momentum into higher-leverage work by combining your strengths with targeted automation and customer-facing experiments.',
    strengthsSnapshot: {
      summary: `You bring ${strengthsText} to the table and can amplify that with structured delivery and communication.`,
      themes: sanitizeStringArray(input.formData.strengths),
      workStyle: ['Pragmatic delivery', 'Cross-functional collaboration', 'Change resilience']
    },
    whereYouAre: {
      summary:
        input.formData.typicalWeek ||
        'You juggle project coordination, stakeholder communication, and ad-hoc problem solving in a changing environment.',
      highlights: [
        'Able to keep partners aligned while work evolves',
        'Translates goals into weekly rituals',
        'Curious about applying AI to streamline repetitive steps'
      ]
    },
    headlineSuggestion: `${jobTitle} translating ambiguity into action`,
    interviewOverview:
      'Describe how you pair structured delivery with curiosity for new tools to create measurable improvements for teams.',
    linkedinHeadline: `${jobTitle} | turning playbooks into AI-augmented delivery`,
    futureRoles: fallbackFutureRoles.map((role) => ({
      title: role.title,
      description: `${role.title} that keeps you close to stakeholders while testing AI-augmented workflows.`,
      reasons: role.reasons,
      skills: (roleSkills.get(role.title) || ['Communication']).map((skill) => ({
        name: skill,
        summary: `${skill} applied to ${role.title.toLowerCase()}.`,
        category: 'Core capability'
      })),
      plan: fallbackActionPlan.map((phase, index) => ({
        monthLabel: `Month ${index + 1}`,
        title: phase.phase,
        description: 'Targeted actions to make measurable progress.',
        actions: phase.items.map((item) => ({
          label: item,
          timePerWeek: '1-2 hrs/week'
        }))
      })),
      learningResources: fallbackLearningResources.map((resource) => ({
        title: resource.label,
        description: 'Starter resource to unblock progress.',
        url: resource.href,
        tags: []
      }))
    })),
    generalLearningResources: fallbackLearningResources.map((resource) => ({
      title: resource.label,
      description: 'Practical support for your roadmap.',
      url: resource.href,
      tags: []
    })),
    interview: {
      headline: `${jobTitle} ready to prototype AI-assisted workflows`,
      howToDescribe:
        'Position yourself as someone who translates change into clear rituals, combining stakeholder empathy with lightweight automation tests.',
      talkingPoints: fallbackInterviewTalkingPoints,
      linkedinHeadline: `${jobTitle} | ${input.goalText}`
    }
  };
};

const mapGeneratedToSnapshotInsights = (snapshot: GeneratedSnapshot): SnapshotInsights => {
  const primaryRole = snapshot.futureRoles[0];

  const mappedActionPlan = primaryRole.plan.map((phase) => ({
    phase: `${phase.monthLabel} — ${phase.title}`,
    items: phase.actions.map((action) => `${action.label} (${action.timePerWeek})`)
  }));

  const learningResources = snapshot.generalLearningResources.length > 0
    ? snapshot.generalLearningResources
    : primaryRole.learningResources;

  return {
    workEvolution: snapshot.whereYouAre.summary,
    futureDirections: snapshot.reportSummary,
    nextSteps: snapshot.interviewOverview,
    futureRoles: snapshot.futureRoles.map((role) => ({
      title: role.title,
      reasons: role.reasons
    })),
    skillsByRole: snapshot.futureRoles.map((role) => ({
      role: role.title,
      skills: role.skills.map((skill) => skill.name)
    })),
    actionPlan: mappedActionPlan,
    learningResources: learningResources.map((resource) => ({
      label: resource.title,
      href: resource.url || '#'
    })),
    interviewTalkingPoints: snapshot.interview.talkingPoints
  };
};

const persistGeneratedSnapshot = async (
  snapshot: GeneratedSnapshot,
  assessmentId: string,
  goalText: string
) => {
  const supabase = getSupabaseClient();

  const { data: reportRow, error: reportError } = await supabase
    .from('reports')
    .insert({
      assessment_id: assessmentId,
      title: snapshot.reportTitle,
      summary: snapshot.reportSummary,
      strengths_snapshot: snapshot.strengthsSnapshot,
      where_you_are: snapshot.whereYouAre,
      goal_text: goalText,
      headline_suggestion: snapshot.linkedinHeadline || snapshot.headlineSuggestion,
      interview_overview: snapshot.interviewOverview,
      status: 'draft'
    })
    .select('id')
    .single();

  if (reportError || !reportRow?.id) {
    throw new Error(reportError?.message || 'Unable to create report record');
  }

  const reportId = reportRow.id as string;

  try {
    for (const [roleIndex, role] of snapshot.futureRoles.entries()) {
      const { data: futureRoleRow, error: futureRoleError } = await supabase
        .from('future_roles')
        .insert({
          report_id: reportId,
          title: role.title,
          description: role.description,
          reasons: role.reasons,
          ordering: roleIndex
        })
        .select('id')
        .single();

      if (futureRoleError || !futureRoleRow?.id) {
        throw new Error(futureRoleError?.message || 'Unable to create future role');
      }

      const futureRoleId = futureRoleRow.id as string;

      if (role.skills?.length) {
        const skillPayload = role.skills.map((skill, index) => ({
          report_id: reportId,
          future_role_id: futureRoleId,
          skill_name: skill.name,
          skill_summary: skill.summary,
          category: skill.category,
          ordering: index
        }));

        const { error: skillsError } = await supabase.from('skills_to_build').insert(skillPayload);
        if (skillsError) {
          throw new Error(skillsError.message);
        }
      }

      for (const [phaseIndex, phase] of role.plan.entries()) {
        const { data: phaseRow, error: phaseError } = await supabase
          .from('ninety_day_plan_phases')
          .insert({
            report_id: reportId,
            future_role_id: futureRoleId,
            month_label: phase.monthLabel,
            title: phase.title,
            description: phase.description,
            position: phaseIndex
          })
          .select('id')
          .single();

        if (phaseError || !phaseRow?.id) {
          throw new Error(phaseError?.message || 'Unable to create plan phase');
        }

        const phaseId = phaseRow.id as string;

        if (phase.actions?.length) {
          const actionPayload = phase.actions.map((action, index) => ({
            id: safeRandomId(),
            report_id: reportId,
            phase_id: phaseId,
            future_role_id: futureRoleId,
            label: action.label,
            time_per_week: action.timePerWeek,
            position: index
          }));

          const { error: actionsError } = await supabase.from('plan_actions').insert(actionPayload);
          if (actionsError) {
            throw new Error(actionsError.message);
          }
        }
      }

      if (role.learningResources?.length) {
        const resourcesPayload = role.learningResources.map((resource, index) => ({
          report_id: reportId,
          future_role_id: futureRoleId,
          title: resource.title,
          description: resource.description,
          url: resource.url,
          tags: resource.tags ?? [],
          position: index
        }));

        const { error: resourcesError } = await supabase.from('learning_resources').insert(resourcesPayload);
        if (resourcesError) {
          throw new Error(resourcesError.message);
        }
      }
    }

    if (snapshot.generalLearningResources?.length) {
      const generalResourcesPayload = snapshot.generalLearningResources.map((resource, index) => ({
        report_id: reportId,
        title: resource.title,
        description: resource.description,
        url: resource.url,
        tags: resource.tags ?? [],
        position: index
      }));

      const { error: resourcesError } = await supabase.from('learning_resources').insert(generalResourcesPayload);
      if (resourcesError) {
        throw new Error(resourcesError.message);
      }
    }

    const { error: interviewError } = await supabase.from('interview_data').insert({
      report_id: reportId,
      headline: snapshot.interview.headline || snapshot.headlineSuggestion,
      how_to_describe: snapshot.interview.howToDescribe || snapshot.interviewOverview,
      talking_points: snapshot.interview.talkingPoints
    });

    if (interviewError) {
      throw new Error(interviewError.message);
    }
  } catch (error) {
    await supabase.from('reports').delete().eq('id', reportId);
    throw error;
  }
};

const parseGeneratedSnapshot = (content: string | null, fallback: GeneratedSnapshot): GeneratedSnapshot => {
  if (!content) return fallback;

  try {
    const parsed = JSON.parse(content.trim());
    if (validateGeneratedSnapshot(parsed)) {
      return parsed;
    }

    console.warn('Snapshot response failed validation; using fallback');
    return fallback;
  } catch (error) {
    console.warn('Failed to parse snapshot insights JSON', error);
    return fallback;
  }
};

const buildSchemaDescription = () => `
Return only valid JSON (no markdown) matching this shape:
{
  "reportTitle": string,
  "reportSummary": string,
  "strengthsSnapshot": { "summary": string, "themes": string[], "workStyle": string[] },
  "whereYouAre": { "summary": string, "highlights": string[] },
  "headlineSuggestion": string,
  "interviewOverview": string,
  "linkedinHeadline": string,
  "futureRoles": [
    {
      "title": string,
      "description": string,
      "reasons": string[],
      "skills": [{ "name": string, "summary": string, "category": string }],
      "plan": [{
        "monthLabel": string,
        "title": string,
        "description": string,
        "actions": [{ "label": string, "timePerWeek": string }]
      }],
      "learningResources": [{ "title": string, "description": string, "url": string, "tags": string[] }]
    }
  ],
  "generalLearningResources": [{ "title": string, "description": string, "url": string, "tags": string[] }],
  "interview": {
    "headline": string,
    "howToDescribe": string,
    "talkingPoints": string[],
    "linkedinHeadline": string
  }
}
- Provide 3-5 futureRoles, each with at least 2 reasons, 3 skills, 3 phases, and 3 actions per phase.
- Include 8-12 total learning resources (mix of role-specific and general) with urls for each futureRoles.
- Keep summaries concise and factual.
- Do not include any extra keys.
`;

export const generateSnapshotInsights = async (input: SnapshotInput): Promise<SnapshotInsights> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const structuredSignals = buildStructuredSignals(input);
  const fallbackGenerated = createFallbackGeneratedSnapshot(input);

  if (!apiKey) {
    console.warn('Missing OpenAI API key; using fallback snapshot insights.');
    if (input.assessmentId) {
      try {
        await persistGeneratedSnapshot(fallbackGenerated, input.assessmentId, input.goalText);
      } catch (error) {
        console.error('Error persisting fallback snapshot', error);
      }
    }
    return mapGeneratedToSnapshotInsights(fallbackGenerated);
  }

  const schemaDescription = buildSchemaDescription();
  let generatedSnapshot = fallbackGenerated;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5.1',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              `You are a Workforce Reinvention and Skills Ecosystem Designer for re-imagined.me. Using the user’s assessment, design structured, future-proof career roadmaps that emphasise: 
                - Emerging and not-yet-mainstream roles Hybrid
                - multidisciplinary and AI-augmented careers Transferable skills that stay valuable 5–10+ years from now For each roadmap
                - prioritise resilience to automation, adaptability, and optionality (multiple paths, not just one job title). 
                - Avoid generic or conventional career suggestions unless they clearly support a future-oriented path
                Respond with JSON only.`
          },
          {
            role: 'user',
            content: `Assessment context: ${JSON.stringify(structuredSignals, null, 2)}`
          },
          {
            role: 'user',
            content: `Follow this schema strictly and ensure every required field is populated: ${schemaDescription}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data?.choices?.[0]?.message?.content ?? null;
    generatedSnapshot = parseGeneratedSnapshot(aiContent, fallbackGenerated);
  } catch (error) {
    console.error('Error generating snapshot insights', error);
    generatedSnapshot = fallbackGenerated;
  }

  if (input.assessmentId) {
    try {
      await persistGeneratedSnapshot(generatedSnapshot, input.assessmentId, input.goalText);
    } catch (error) {
      console.error('Error saving generated snapshot to Supabase', error);
    }
  }

  return mapGeneratedToSnapshotInsights(generatedSnapshot);
};
