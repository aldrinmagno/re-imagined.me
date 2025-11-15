import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', to: '/' },
    { name: 'How it works', to: '/how-it-works' },
    { name: 'About', to: '/about' },
    { name: 'Contact', to: '/contact' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-6">
            <Link
              to="/"
              className="flex items-center gap-3 text-lg font-semibold text-slate-800 transition hover:text-emerald-600"
            >
              <Logo variant="compact" />
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navigation.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.name}
                    to={item.to}
                    className={`transition-colors ${
                      isActive
                        ? 'text-emerald-600'
                        : 'text-slate-600 hover:text-emerald-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center">
              <Link
                to="/sign-in"
                className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-400"
              >
                Join waitlist
              </Link>
            </div>

            <button
              className="md:hidden text-slate-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-slate-200 text-sm">
              {navigation.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.name}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-full px-4 py-2 font-medium transition ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <Link
                to="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-full border border-emerald-200 bg-emerald-500 px-4 py-2 text-center font-semibold text-white transition hover:bg-emerald-400"
              >
                Join waitlist
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white/90 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-between gap-6 text-sm text-slate-500 sm:flex-row">
            <div className="flex gap-6">
              <Link to="/privacy" className="transition hover:text-emerald-600">
                Privacy
              </Link>
            </div>
            <div className="text-sm text-slate-500">
              © 2025 re-imagined.me
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
