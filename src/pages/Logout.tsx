import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthPageLayout from '../components/AuthPageLayout';
import { useAuth } from '../context/AuthContext';

function Logout() {
  const { signOut } = useAuth();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        await signOut();
        if (isMounted) {
          setStatus('success');
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to log out right now.');
          setStatus('error');
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [signOut]);

  let content: React.ReactNode = null;

  if (status === 'pending') {
    content = <p className="text-sm text-slate-600">Signing you out…</p>;
  } else if (status === 'success') {
    content = (
      <div className="space-y-4 text-sm text-slate-700">
        <p>You have been signed out of re-imagined.me.</p>
        <p>
          Ready to jump back in?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
            Log in again
          </Link>
          .
        </p>
      </div>
    );
  } else {
    content = (
      <div className="space-y-4 text-sm text-rose-600">
        <p>{error}</p>
        <p>
          Please try again or{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
            return to login
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <AuthPageLayout title="Log out" subtitle="Sign out of your account on this device.">
      {content}
    </AuthPageLayout>
  );
}

export default Logout;
