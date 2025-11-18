import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import PortalHome from './pages/portal/PortalHome';
import Roadmap from './pages/portal/Roadmap';
import Journal from './pages/portal/Journal';
import Community from './pages/portal/Community';
import Profile from './pages/portal/Profile';

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
        </Route>

        <Route element={<ProtectedRoute><PortalLayout /></ProtectedRoute>}>
          <Route path="/portal" element={<PortalHome />} />
          <Route path="/portal/roadmap" element={<Roadmap />} />
          <Route path="/portal/journal" element={<Journal />} />
          <Route path="/portal/community" element={<Community />} />
          <Route path="/portal/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
