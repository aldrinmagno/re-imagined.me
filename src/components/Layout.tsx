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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-6">
            <Link
              to="/"
              className="flex items-center gap-3 text-lg font-semibold text-slate-100 transition hover:text-emerald-200"
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
                        ? 'text-emerald-200'
                        : 'text-slate-300 hover:text-emerald-200'
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
                className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 shadow-sm transition hover:border-emerald-200/60 hover:bg-emerald-200/10 hover:text-emerald-100"
              >
                Join waitlist
              </Link>
            </div>

            <button
              className="md:hidden text-slate-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-white/10 text-sm">
              {navigation.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.name}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-full px-4 py-2 font-medium transition ${
                      isActive
                        ? 'bg-emerald-400/20 text-emerald-200'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <Link
                to="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-center font-semibold text-slate-100 transition hover:border-emerald-200/60 hover:bg-emerald-200/10 hover:text-emerald-100"
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

      <footer className="border-t border-white/10 bg-slate-950/80 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-between gap-6 text-sm text-slate-400 sm:flex-row">
            <div className="flex gap-6">
              <Link to="/privacy" className="transition hover:text-emerald-200">
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
