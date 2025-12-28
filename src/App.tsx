import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import PortalLayout from './components/PortalLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import JoinWaitlist from './pages/JoinWaitlist';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Logout from './pages/Logout';
import SampleReport from './pages/SampleReport';
import ReportLayout from './components/report/ReportLayout';
import ReportRolesSkills from './pages/portal/report/ReportRolesSkills';
import ReportPlan from './pages/portal/report/ReportPlan';
import ReportResources from './pages/portal/report/ReportResources';
import ReportInterview from './pages/portal/report/ReportInterview';
import Profile from './pages/portal/Profile';
import ImpactInventory from './pages/portal/ImpactInventory';
import CVVersions from './pages/portal/CVVersions';
import Radar from './pages/portal/Radar';

const ReportAliasRedirect = () => {
  const { section } = useParams();
  const target = section ? `/portal/report/${section}` : '/portal/report/roles-skills';

  return <Navigate to={target} replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/join-waitlist" element={<JoinWaitlist />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/sample-report" element={<SampleReport />} />
        </Route>

        <Route element={<ProtectedRoute><PortalLayout /></ProtectedRoute>}>
          <Route path="/portal" element={<ReportLayout />}>
            <Route index element={<Navigate to="/portal/report/roles-skills" replace />} />
          </Route>
          <Route path="/portal/inventory" element={<ReportLayout />}>
            <Route index element={<ImpactInventory />} />
          </Route>
          <Route path="/portal/cv" element={<ReportLayout />}>
            <Route index element={<CVVersions />} />
          </Route>
          <Route path="/portal/radar" element={<ReportLayout />}>
            <Route index element={<Radar />} />
          </Route>
          <Route path="/portal/profile" element={<ReportLayout />}>
            <Route index element={<Profile />} />
          </Route>
          <Route path="/portal/report" element={<ReportLayout />}>
            <Route index element={<Navigate to="/portal/report/roles-skills" replace />} />
            <Route path="roles-skills" element={<ReportRolesSkills />} />
            <Route path="overview" element={<Navigate to="/portal/report/roles-skills" replace />} />
            <Route path="roles" element={<Navigate to="/portal/report/roles-skills" replace />} />
            <Route path="skills" element={<Navigate to="/portal/report/roles-skills" replace />} />
            <Route path="plan" element={<ReportPlan />} />
            <Route path="resources" element={<ReportResources />} />
            <Route path="interview" element={<Navigate to="/portal/interview" replace />} />
          </Route>
          <Route path="/portal/interview" element={<ReportLayout />}>
            <Route index element={<ReportInterview />} />
          </Route>
        </Route>

        <Route path="/inventory" element={<Navigate to="/portal/inventory" replace />} />
        <Route path="/cv" element={<Navigate to="/portal/cv" replace />} />
        <Route path="/radar" element={<Navigate to="/portal/radar" replace />} />

        <Route path="/report" element={<Navigate to="/report/roles-skills" replace />} />
        <Route path="/report/:section" element={<ReportAliasRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;
