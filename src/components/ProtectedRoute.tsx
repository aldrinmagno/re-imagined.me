import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading your portal…
      </div>
    );
  }

  if (!user) {
    const fallbackPath = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from: fallbackPath || '/portal' }} />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}

export default ProtectedRoute;
