import { createContext, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useReportData } from '../../lib/useReportData';
import type { UseReportDataResult } from '../../lib/useReportData';
import type { AssessmentFormData } from '../../types/assessment';
import type { ReportContent } from '../../types/report';
import type { PlanItemInput, PlanItemUpdates, ActionMutationResult } from '../../lib/useReportData';

type ReportContextValue = {
  assessment: AssessmentFormData;
  goalText: string;
  completedActions: Set<string>;
  toggleAction: (id: string) => Promise<void>;
  progressError: string;
  reportContent: ReportContent;
  selectedRoleId: string | null;
  setSelectedRoleId: (roleId: string | null) => void;
  addPlanItem: (input: PlanItemInput) => Promise<ActionMutationResult>;
  updatePlanItem: (id: string, updates: PlanItemUpdates) => Promise<ActionMutationResult>;
  deletePlanItem: (id: string) => Promise<ActionMutationResult>;
};

const ReportContext = createContext<ReportContextValue | undefined>(undefined);

export const useReportContext = () => {
  const context = useContext(ReportContext);

  if (!context) {
    throw new Error('useReportContext must be used within a ReportLayout');
  }

  return context;
};

export const reportSectionLinks = [
  { to: 'roles-skills', label: 'Roles & Skills' },
  { to: 'plan', label: 'Plan' },
  { to: 'resources', label: 'Resources' }
];

function ReportLayout() {
  const location = useLocation();
  const isProfilePage = location.pathname.startsWith('/portal/profile');
  const headerLabel = isProfilePage ? 'Your account' : 'Your personalised report';
  const headerTitle = isProfilePage ? 'Profile' : 'Snapshot of where you are now';
  const headerDescription = isProfilePage
    ? 'Review details from your latest assessment.'
    : 'Latest assessment submitted on your account.';

  const reportData: UseReportDataResult = useReportData();
  const { assessment, loading, error, contentError } = reportData;

  if (loading) {
    return <p className="text-slate-600">Loading your report…</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!assessment) {
    return <p className="text-slate-600">No assessment found yet. Complete the assessment to see your report.</p>;
  }

  return (
    <ReportContext.Provider
      value={{
        assessment,
        goalText: reportData.goalText,
        completedActions: reportData.completedActions,
        toggleAction: reportData.toggleAction,
        progressError: reportData.progressError,
        reportContent: reportData.reportContent,
        selectedRoleId: reportData.selectedRoleId,
        setSelectedRoleId: reportData.setSelectedRoleId,
        addPlanItem: reportData.addPlanItem,
        updatePlanItem: reportData.updatePlanItem,
        deletePlanItem: reportData.deletePlanItem
      }}
    >
      <div className="space-y-6 text-slate-900">
        <header className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{headerLabel}</p>
          <h1 className="text-2xl font-bold text-slate-900">{headerTitle}</h1>
          <p className="text-sm text-slate-700">{headerDescription}</p>
        </header>

        {contentError ? <p className="text-sm text-amber-600">{contentError}</p> : null}

        <Outlet />
      </div>
    </ReportContext.Provider>
  );
}

export default ReportLayout;
