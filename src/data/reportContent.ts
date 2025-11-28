export type FutureRole = {
  title: string;
  reasons: string[];
};

export type RoleSkill = {
  role: string;
  summary: string;
  skills: string[];
};

export type ActionItem = {
  id: string;
  title: string;
  estimate: string;
};

export type ActionPhase = {
  title: string;
  description: string;
  items: ActionItem[];
};

export type LearningResource = {
  title: string;
  description: string;
  link: string;
  supports: string;
};

export const sampleFutureRoles: FutureRole[] = [
  {
    title: 'AI-Augmented Project Manager',
    reasons: [
      'Blend people leadership with AI-assisted delivery to steer cross-functional teams',
      'Use your stakeholder communication skills to translate strategy into clear milestones'
    ]
  },
  {
    title: 'Customer Insights Analyst',
    reasons: [
      'Pair curiosity with data tools to surface patterns in customer behaviour',
      'Guide teams on which opportunities to pursue based on evidence and empathy'
    ]
  },
  {
    title: 'Product Operations Specialist',
    reasons: [
      'Streamline processes, rituals, and tooling so product teams can ship faster',
      'Bridge product, engineering, and go-to-market partners with clear playbooks'
    ]
  }
];

export const roleSkillGroups: RoleSkill[] = [
  {
    role: 'AI-Augmented Project Manager',
    summary: 'Pair delivery leadership with automation and clear communication.',
    skills: [
      'Adaptive planning with AI copilots',
      'Workflow automation fundamentals',
      'Risk and dependency mapping',
      'Stakeholder storytelling'
    ]
  },
  {
    role: 'Customer Insights Analyst',
    summary: 'Translate raw signals into decisions that teams can act on quickly.',
    skills: [
      'Basic SQL and lightweight data cleaning',
      'Survey design and synthesis',
      'Data storytelling with clear visuals',
      'Experiment design for product questions'
    ]
  },
  {
    role: 'Product Operations Specialist',
    summary: 'Keep teams unblocked with crisp rituals, documentation, and metrics.',
    skills: [
      'Notion/Confluence playbook design',
      'Process mapping and iteration',
      'Release readiness checklists',
      'Team health and feedback loops'
    ]
  }
];

export const actionPlanPhases: ActionPhase[] = [
  {
    title: 'Month 1 – Foundations',
    description: 'Stabilize your baseline with lightweight systems and clarity on where you are heading.',
    items: [
      { id: 'm1-1', title: 'Draft a 90-day vision and align it with your manager or mentor', estimate: '~1h/week' },
      { id: 'm1-2', title: 'Complete a practical AI-aware project planning course', estimate: '~2h/week' },
      { id: 'm1-3', title: 'Map your current projects and flag 2–3 automation opportunities', estimate: '~1h/week' },
      { id: 'm1-4', title: 'Create a simple operating cadence (weekly review + backlog grooming)', estimate: '~1h/week' }
    ]
  },
  {
    title: 'Month 2 – Momentum',
    description: 'Ship visible wins that link your strengths to the future roles you want.',
    items: [
      { id: 'm2-1', title: 'Pilot an AI-assisted workflow (e.g., drafting briefs, summarising research)', estimate: '~2h/week' },
      { id: 'm2-2', title: 'Publish a short case note on what worked and what you’d change next time', estimate: '~1h/week' },
      { id: 'm2-3', title: 'Shadow or pair with someone already in your target role for one project', estimate: '~1.5h/week' },
      { id: 'm2-4', title: 'Refresh your portfolio or internal wiki with new examples', estimate: '~1h/week' }
    ]
  },
  {
    title: 'Month 3 – Proof',
    description: 'Translate your wins into evidence and set up repeatable habits.',
    items: [
      { id: 'm3-1', title: 'Package a “before and after” story that highlights measurable impact', estimate: '~1h/week' },
      { id: 'm3-2', title: 'Build a reusable template or checklist for your team', estimate: '~1.5h/week' },
      { id: 'm3-3', title: 'Update your LinkedIn headline and bio with the outcomes you delivered', estimate: '~0.5h/week' },
      { id: 'm3-4', title: 'Book a feedback session to validate your next quarter focus', estimate: '~1h/week' }
    ]
  }
];

export const learningResources: LearningResource[] = [
  {
    title: 'Adaptive Planning with AI Copilots',
    description: 'A short walkthrough on pairing traditional project planning with AI-assisted estimation.',
    link: 'https://example.com/adaptive-planning',
    supports: 'Skill: Adaptive planning with AI copilots'
  },
  {
    title: 'Workflow Automation Starter Kit',
    description: 'Step-by-step tutorial to automate repetitive updates across your tools.',
    link: 'https://example.com/automation-starter',
    supports: 'Skill: Workflow automation fundamentals'
  },
  {
    title: 'Data Storytelling for Teams',
    description: 'Learn to turn raw insights into crisp narratives that influence decisions.',
    link: 'https://example.com/data-storytelling',
    supports: 'Role: Customer Insights Analyst'
  },
  {
    title: 'Lightweight SQL for Product Questions',
    description: 'Hands-on SQL micro-lessons aimed at PMs and analysts answering real product queries.',
    link: 'https://example.com/sql-for-product',
    supports: 'Skill: Basic SQL and lightweight data cleaning'
  },
  {
    title: 'Rituals for Product Ops Teams',
    description: 'Templates and cadences to keep cross-functional teams unblocked and aligned.',
    link: 'https://example.com/product-ops-rituals',
    supports: 'Role: Product Operations Specialist'
  },
  {
    title: 'Interview-Ready Case Notes',
    description: 'Guide to packaging your projects into concise case stories with measurable impact.',
    link: 'https://example.com/interview-case-notes',
    supports: 'Skill: Stakeholder storytelling'
  }
];

export const interviewPitches = [
  'I combine deep experience in cross-functional delivery with a growing toolkit of AI copilots to keep teams moving.',
  'I translate between stakeholders with clear, calm communication and package insights into decisions people can act on.',
  'I look for practical automation wins that save time without sacrificing quality, then share the playbooks with others.',
  'I turn ambiguous goals into lightweight plans, measurable milestones, and stories that highlight impact.',
  'I’m comfortable piloting new tools, learning fast, and teaching teams how to work with them safely.'
];

export const interviewTalkingPoints = [
  'Show how your current role already uses the same strengths you’ll need in the next one—like coordinating stakeholders or simplifying messy workflows.',
  'Share a recent project where you adapted quickly to a new process, domain, or tool, and explain the measurable outcome.',
  'Highlight how you’re experimenting with AI or automation to work faster and teach others, even if it’s a small pilot.'
];

export const sampleHeadlineSuggestion =
  'Project Manager | Transitioning into AI-augmented Operations | Turning complex workflows into simple systems';
