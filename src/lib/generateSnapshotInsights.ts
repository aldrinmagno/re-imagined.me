import type { AssessmentFormData, SnapshotInsights } from '../types/assessment';
import { getSupabaseClient } from './supabaseClient';

interface SnapshotInput {
  formData: AssessmentFormData;
  goalText: string;
  industryLabels?: string[];
}

interface PersistSnapshotInput extends SnapshotInput {
  assessmentId: string;
  insights: SnapshotInsights;
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

const formatIndustries = (industries?: string[]) =>
  industries && industries.length > 0 ? industries.join(', ') : null;

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

const buildStructuredSignals = (input: SnapshotInput) => {
  const trimmedOther = input.formData.strengthsOther?.trim();

  return {
    jobTitle: input.formData.jobTitle || null,
    industries: input.industryLabels ?? [],
    yearsExperience: input.formData.yearsExperience || null,
    lookingFor: normalizeLookingFor(input.formData.lookingFor),
    transitionTarget: input.formData.transitionTarget?.trim() || null,
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
      'Focus your next 90 days on clarifying outcomes, upskilling in AI-enabled tooling, and piloting a project that showcases how you solve emerging problems.',
    futureRoles: fallbackFutureRoles,
    skillsByRole: fallbackSkillsByRole,
    actionPlan: fallbackActionPlan,
    learningResources: fallbackLearningResources,
    interviewTalkingPoints: fallbackInterviewTalkingPoints
  };
};

const parseFutureRoles = (value: unknown): SnapshotInsights['futureRoles'] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const title = typeof (entry as { title?: unknown }).title === 'string' ? entry.title.trim() : '';
      const reasons = sanitizeStringArray((entry as { reasons?: unknown }).reasons);

      if (!title || reasons.length === 0) return null;

      return { title, reasons };
    })
    .filter(Boolean) as SnapshotInsights['futureRoles'];
};

const parseSkillsByRole = (value: unknown): SnapshotInsights['skillsByRole'] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const role = typeof (entry as { role?: unknown }).role === 'string' ? entry.role.trim() : '';
      const skills = sanitizeStringArray((entry as { skills?: unknown }).skills);

      if (!role || skills.length === 0) return null;

      return { role, skills };
    })
    .filter(Boolean) as SnapshotInsights['skillsByRole'];
};

const parseActionPlan = (value: unknown): SnapshotInsights['actionPlan'] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const phase = typeof (entry as { phase?: unknown }).phase === 'string' ? entry.phase.trim() : '';
      const items = sanitizeStringArray((entry as { items?: unknown }).items);

      if (!phase || items.length === 0) return null;

      return { phase, items };
    })
    .filter(Boolean) as SnapshotInsights['actionPlan'];
};

const parseLearningResources = (value: unknown): SnapshotInsights['learningResources'] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const label = typeof (entry as { label?: unknown }).label === 'string' ? entry.label.trim() : '';
      const href = typeof (entry as { href?: unknown }).href === 'string' ? entry.href.trim() : '';

      if (!label) return null;

      return { label, href: href || '#' };
    })
    .filter(Boolean) as SnapshotInsights['learningResources'];
};

const parseInsightsFromContent = (content: string, fallback: SnapshotInsights): SnapshotInsights | null => {
  if (!content) {
    return null;
  }

  try {
    const parsed = JSON.parse(content.trim());

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const insights: Partial<SnapshotInsights> = {};

    if (typeof (parsed as { workEvolution?: unknown }).workEvolution === 'string') {
      insights.workEvolution = (parsed as { workEvolution: string }).workEvolution.trim();
    }
    if (typeof (parsed as { futureDirections?: unknown }).futureDirections === 'string') {
      insights.futureDirections = (parsed as { futureDirections: string }).futureDirections.trim();
    }
    if (typeof (parsed as { nextSteps?: unknown }).nextSteps === 'string') {
      insights.nextSteps = (parsed as { nextSteps: string }).nextSteps.trim();
    }

    const futureRoles = parseFutureRoles((parsed as { futureRoles?: unknown }).futureRoles);
    if (futureRoles.length > 0) {
      insights.futureRoles = futureRoles;
    }

    const skillsByRole = parseSkillsByRole((parsed as { skillsByRole?: unknown }).skillsByRole);
    if (skillsByRole.length > 0) {
      insights.skillsByRole = skillsByRole;
    }

    const actionPlan = parseActionPlan((parsed as { actionPlan?: unknown }).actionPlan);
    if (actionPlan.length > 0) {
      insights.actionPlan = actionPlan;
    }

    const learningResources = parseLearningResources((parsed as { learningResources?: unknown }).learningResources);
    if (learningResources.length > 0) {
      insights.learningResources = learningResources;
    }

    const interviewTalkingPoints = sanitizeStringArray(
      (parsed as { interviewTalkingPoints?: unknown }).interviewTalkingPoints
    );
    if (interviewTalkingPoints.length > 0) {
      insights.interviewTalkingPoints = interviewTalkingPoints;
    }

    if (Object.keys(insights).length === 0) {
      return null;
    }

    return {
      ...fallback,
      ...insights
    };
  } catch (error) {
    console.warn('Failed to parse snapshot insights JSON', error);
  }

  return null;
};

export const generateSnapshotInsights = async (input: SnapshotInput): Promise<SnapshotInsights> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const structuredSignals = buildStructuredSignals(input);
  const fallbackInsights = createFallbackInsights(input);

  if (!apiKey) {
    console.warn('Missing OpenAI API key; using fallback snapshot insights.');
    return fallbackInsights;
  }

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
        messages: [
          {
            role: 'system',
            content:
              'You are a concise career strategist. Return JSON only with keys workEvolution, futureDirections, nextSteps, futureRoles, skillsByRole, actionPlan, learningResources, interviewTalkingPoints. Keep workEvolution, futureDirections, and nextSteps under 60 words each. For futureRoles provide 3 objects with title and 2 short reasons. skillsByRole should map to each role with 3 skills. actionPlan should include 3 phases with 3 bullet items each. Provide 4 learningResources with label and href, and 5 interviewTalkingPoints as concise bullet strings.'
          },
          {
            role: 'user',
            content: `Structured signals for analytics and recommendations: ${JSON.stringify(structuredSignals)}`
          },
          {
            role: 'user',
            content: `Create a short snapshot for someone currently working as ${input.formData.jobTitle || 'a professional'} in ${
              formatIndustries(input.industryLabels) ?? 'their industry'
            }. They are looking to ${input.goalText}${
              input.formData.transitionTarget?.trim()
                ? `. They want to transition into ${input.formData.transitionTarget.trim()}`
                : ''
            }. Their key strengths are ${
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
    const parsed = parseInsightsFromContent(aiContent, fallbackInsights);

    if (parsed) {
      return parsed;
    }

    return fallbackInsights;
  } catch (error) {
    console.error('Error generating snapshot insights', error);
    return fallbackInsights;
  }
};

const parsePhaseLabel = (phase: string, index: number) => {
  if (!phase) {
    return { monthLabel: `Month ${index + 1}`, title: `Phase ${index + 1}` };
  }

  const emDashSplit = phase.split('—').map((part) => part.trim()).filter(Boolean);
  if (emDashSplit.length >= 2) {
    return { monthLabel: emDashSplit[0], title: emDashSplit.slice(1).join(' — ') };
  }

  const dashSplit = phase.split('-').map((part) => part.trim()).filter(Boolean);
  if (dashSplit.length >= 2) {
    return { monthLabel: dashSplit[0], title: dashSplit.slice(1).join(' - ') };
  }

  return { monthLabel: `Month ${index + 1}`, title: phase };
};

export const persistSnapshotReport = async (input: PersistSnapshotInput) => {
  const supabase = getSupabaseClient();
  const { assessmentId, insights } = input;
  const structuredSignals = buildStructuredSignals(input);

  const reportSummary = `${insights.futureDirections} ${insights.nextSteps}`.trim();
  const interviewOverview = `${insights.workEvolution}\n${insights.nextSteps}`.trim();
  const headlineSuggestion = insights.futureRoles?.[0]?.title
    ? `${insights.futureRoles[0].title} who blends ${formatStrengths(structuredSignals.strengths) || 'core strengths'}`
    : `Future-ready ${input.formData.jobTitle || 'professional'}`;

  const { data: reportRow, error: reportError } = await supabase
    .from('reports')
    .insert({
      assessment_id: assessmentId,
      title: 'Career snapshot',
      summary: reportSummary || null,
      strengths_snapshot: {
        strengths: structuredSignals.strengths,
        strengthsOther: structuredSignals.strengthsOther,
        workPreferences: structuredSignals.workPreferences,
        typicalWeek: structuredSignals.typicalWeek
      },
      where_you_are: {
        jobTitle: structuredSignals.jobTitle,
        industries: structuredSignals.industries,
        yearsExperience: structuredSignals.yearsExperience,
        lookingFor: structuredSignals.lookingFor,
        transitionTarget: structuredSignals.transitionTarget
      },
      goal_text: input.goalText,
      headline_suggestion: headlineSuggestion,
      interview_overview: interviewOverview
    })
    .select('id')
    .single();

  if (reportError || !reportRow) {
    console.error('Failed to create report', reportError);
    throw reportError || new Error('Unable to create report');
  }

  const reportId = reportRow.id as string;

  const futureRolesPayload = insights.futureRoles.map((role, index) => ({
    report_id: reportId,
    title: role.title,
    description: null,
    reasons: role.reasons,
    ordering: index
  }));

  const { data: futureRolesRows, error: futureRolesError } = await supabase
    .from('future_roles')
    .insert(futureRolesPayload)
    .select('id, title');

  if (futureRolesError) {
    console.error('Failed to create future roles', futureRolesError);
    throw futureRolesError;
  }

  const futureRoleIdByTitle = new Map<string, string>();
  (futureRolesRows || []).forEach((row: { id: string; title: string }) => {
    futureRoleIdByTitle.set(row.title, row.id);
  });

  const skillsPayload = insights.skillsByRole.flatMap((entry) =>
    entry.skills.map((skill, index) => ({
      report_id: reportId,
      future_role_id: futureRoleIdByTitle.get(entry.role) || null,
      skill_name: skill,
      skill_summary: entry.skills.length > 3 ? entry.skills.slice(0, 3).join(', ') : null,
      category: null,
      ordering: index
    }))
  );

  const { error: skillsError } = await supabase.from('skills_to_build').insert(skillsPayload);

  if (skillsError) {
    console.error('Failed to create skills', skillsError);
    throw skillsError;
  }

  const phasesPayload = insights.actionPlan.map((phase, index) => {
    const parsed = parsePhaseLabel(phase.phase, index);
    return {
      report_id: reportId,
      future_role_id: null,
      month_label: parsed.monthLabel,
      title: parsed.title,
      description: insights.nextSteps,
      position: index
    };
  });

  const { data: phaseRows, error: phasesError } = await supabase
    .from('ninety_day_plan_phases')
    .insert(phasesPayload)
    .select('id, position');

  if (phasesError) {
    console.error('Failed to create plan phases', phasesError);
    throw phasesError;
  }

  const actionsPayload = phaseRows.flatMap((phaseRow, phaseIndex) =>
    (insights.actionPlan[phaseIndex]?.items || []).map((item, itemIndex) => ({
      id: crypto.randomUUID(),
      report_id: reportId,
      phase_id: phaseRow.id,
      future_role_id: null,
      label: item,
      time_per_week: null,
      position: itemIndex
    }))
  );

  const { error: actionsError } = await supabase.from('plan_actions').insert(actionsPayload);

  if (actionsError) {
    console.error('Failed to create plan actions', actionsError);
    throw actionsError;
  }

  const learningResourcesPayload = insights.learningResources.map((resource, index) => ({
    report_id: reportId,
    future_role_id: null,
    skill_id: null,
    title: resource.label,
    description: null,
    url: resource.href || '#',
    tags: [],
    position: index
  }));

  const { error: resourcesError } = await supabase.from('learning_resources').insert(learningResourcesPayload);

  if (resourcesError) {
    console.error('Failed to create learning resources', resourcesError);
    throw resourcesError;
  }

  const { error: interviewError } = await supabase.from('interview_data').insert({
    report_id: reportId,
    headline: headlineSuggestion,
    how_to_describe: `${insights.futureDirections}\n${insights.nextSteps}`,
    talking_points: insights.interviewTalkingPoints
  });

  if (interviewError) {
    console.error('Failed to create interview data', interviewError);
    throw interviewError;
  }

  return reportId;
};
