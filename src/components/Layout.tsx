import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/"
              className="flex items-center gap-3 text-xl font-semibold text-slate-900 hover:text-slate-700 transition"
            >
              <Logo variant="compact" />
            </Link>

            <div className="hidden md:flex space-x-8">
              <Link to="/how-it-works" className="text-slate-600 hover:text-slate-900 transition">
                How it works
              </Link>
              <Link to="/about" className="text-slate-600 hover:text-slate-900 transition">
                About
              </Link>
              <Link to="/sign-in" className="text-slate-600 hover:text-slate-900 transition">
                Sign in
              </Link>
            </div>

            <button
              className="md:hidden text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-slate-200">
              <Link
                to="/how-it-works"
                className="block w-full text-left text-slate-600 hover:text-slate-900 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it works
              </Link>
              <Link
                to="/about"
                className="block w-full text-left text-slate-600 hover:text-slate-900 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/sign-in"
                className="block w-full text-left text-slate-600 hover:text-slate-900 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-6 text-sm text-slate-600">
              <Link to="/privacy" className="hover:text-slate-900 transition">
                Privacy
              </Link>
              <Link to="/privacy" className="hover:text-slate-900 transition">
                Terms
              </Link>
              <Link to="/contact" className="hover:text-slate-900 transition">
                Contact
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
