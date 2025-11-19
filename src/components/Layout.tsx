import { useState } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/portal" replace />;
  }


  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <nav className="top-0 z-50 border-b border-slate-300/80 bg-white/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-6">
            <Link
              to="/"
              className="flex items-center gap-3 text-lg font-semibold text-slate-900 transition hover:text-emerald-600"
            >
              <Logo variant="compact" />
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="/login" className="text-slate-700 transition hover:text-emerald-600">
                Log in
              </Link>
              <Link
                to="/join-waitlist"
                className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-400"
              >
                Join waitlist
              </Link>
            </div>
            <button
              className="md:hidden text-slate-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-slate-200 text-sm">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-full border border-slate-200 px-4 py-2 text-center font-semibold text-slate-800 transition hover:border-emerald-300 hover:text-emerald-600"
              >
                Log in
              </Link>

              <Link
                to="/join-waitlist"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-full border border-emerald-300 bg-emerald-500 px-4 py-2 text-center font-semibold text-white transition hover:bg-emerald-400"
              >
                Join waitlist
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="border-t border-slate-300 bg-white/95 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-between gap-6 text-sm text-slate-600 sm:flex-row">
            <div className="flex gap-6">
              <Link to="/privacy" className="transition hover:text-emerald-600">
                Privacy
              </Link>
            </div>
            <div className="text-sm text-slate-600">
              © 2025 re-imagined.me
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
