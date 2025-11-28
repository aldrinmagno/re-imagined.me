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
import ReportOverview from './pages/portal/report/ReportOverview';
import ReportRoles from './pages/portal/report/ReportRoles';
import ReportSkills from './pages/portal/report/ReportSkills';
import ReportPlan from './pages/portal/report/ReportPlan';
import ReportResources from './pages/portal/report/ReportResources';
import ReportInterview from './pages/portal/report/ReportInterview';

const ReportAliasRedirect = () => {
  const { section } = useParams();
  const target = section ? `/portal/report/${section}` : '/portal/report/overview';

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
            <Route index element={<Navigate to="/portal/report/overview" replace />} />
          </Route>
          <Route path="/portal/report" element={<ReportLayout />}>
            <Route index element={<Navigate to="/portal/report/overview" replace />} />
            <Route path="overview" element={<ReportOverview />} />
            <Route path="roles" element={<ReportRoles />} />
            <Route path="skills" element={<ReportSkills />} />
            <Route path="plan" element={<ReportPlan />} />
            <Route path="resources" element={<ReportResources />} />
            <Route path="interview" element={<ReportInterview />} />
          </Route>
        </Route>

        <Route path="/report" element={<Navigate to="/report/overview" replace />} />
        <Route path="/report/:section" element={<ReportAliasRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;
