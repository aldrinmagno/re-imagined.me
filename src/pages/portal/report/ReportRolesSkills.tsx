import CVBulletsWidget from '../../../components/report/CVBulletsWidget';
import RolesSkillsSection from '../../../components/report/RolesSkillsSection';

function ReportRolesSkills() {
  return (
    <div className="space-y-6">
      <RolesSkillsSection />
      <CVBulletsWidget />
    </div>
  );
}

export default ReportRolesSkills;
