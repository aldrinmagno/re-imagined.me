import type { ActionPlanCategory, ActionPlanData, ActionPlanWeek } from '../types/actionPlan';
import type { ReportContent } from '../types/report';

type CategoryPools = Record<ActionPlanCategory, string[]>;

const fallbackTasks: CategoryPools = {
  upskill: ['Complete a focused learning sprint on a role-relevant skill.'],
  cv: ['Refresh your CV headline and summary to match the role focus.'],
  application: ['Submit one role application and log the outcome.'],
  networking: ['Reach out to one new contact and log notes.'],
  interview_prep: ['Practice one interview story using STAR format.']
};

const categoryKeywords: Record<ActionPlanCategory, string[]> = {
  upskill: ['learn', 'course', 'study', 'skill', 'training', 'cert'],
  cv: ['cv', 'resume', 'portfolio', 'headline', 'summary'],
  application: ['apply', 'application', 'submit', 'job'],
  networking: ['network', 'coffee', 'reach', 'connect', 'referral'],
  interview_prep: ['interview', 'story', 'mock', 'prep', 'practice']
};

const categorizeTask = (task: string): ActionPlanCategory | null => {
  const lower = task.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords) as [ActionPlanCategory, string[]][]) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return category;
    }
  }
  return null;
};

const buildPoolsFromReport = (reportContent: ReportContent): CategoryPools => {
  const pools: CategoryPools = {
    upskill: [],
    cv: [],
    application: [],
    networking: [],
    interview_prep: []
  };

  reportContent.actionPlanPhases.forEach((phase) => {
    phase.items.forEach((item) => {
      const category = categorizeTask(item.title);
      if (category) {
        pools[category].push(item.title);
      } else {
        pools.upskill.push(item.title);
      }
    });
  });

  (Object.keys(pools) as ActionPlanCategory[]).forEach((category) => {
    if (pools[category].length === 0) {
      pools[category] = [...fallbackTasks[category]];
    }
  });

  return pools;
};

const getTaskForWeek = (pool: string[], weekIndex: number) => {
  if (pool.length === 0) return '';
  return pool[weekIndex % pool.length];
};

const buildWeek = (weekIndex: number, pools: CategoryPools): ActionPlanWeek => ({
  id: `week-${weekIndex + 1}`,
  label: `Week ${weekIndex + 1}`,
  tasks: {
    upskill: getTaskForWeek(pools.upskill, weekIndex),
    cv: getTaskForWeek(pools.cv, weekIndex),
    application: getTaskForWeek(pools.application, weekIndex),
    networking: getTaskForWeek(pools.networking, weekIndex),
    interview_prep: getTaskForWeek(pools.interview_prep, weekIndex)
  },
  completed: {
    upskill: false,
    cv: false,
    application: false,
    networking: false,
    interview_prep: false
  }
});

export const generateBalancedActionPlan = (reportContent: ReportContent, weeks = 12): ActionPlanData => {
  const pools = buildPoolsFromReport(reportContent);
  return {
    weeks: Array.from({ length: weeks }, (_, index) => buildWeek(index, pools))
  };
};

export const regenerateWeek = (
  plan: ActionPlanData,
  weekIndex: number,
  reportContent: ReportContent
): ActionPlanData => {
  const pools = buildPoolsFromReport(reportContent);
  const weeks = plan.weeks.map((week, index) => {
    if (index !== weekIndex) return week;
    return {
      ...week,
      tasks: {
        upskill: getTaskForWeek(pools.upskill, Math.floor(Math.random() * pools.upskill.length)),
        cv: getTaskForWeek(pools.cv, Math.floor(Math.random() * pools.cv.length)),
        application: getTaskForWeek(pools.application, Math.floor(Math.random() * pools.application.length)),
        networking: getTaskForWeek(pools.networking, Math.floor(Math.random() * pools.networking.length)),
        interview_prep: getTaskForWeek(pools.interview_prep, Math.floor(Math.random() * pools.interview_prep.length))
      },
      completed: {
        upskill: false,
        cv: false,
        application: false,
        networking: false,
        interview_prep: false
      }
    };
  });

  return { weeks };
};
