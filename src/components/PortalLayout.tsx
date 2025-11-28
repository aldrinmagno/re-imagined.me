import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { reportSectionLinks } from './report/ReportLayout';

const portalLinks = [
  { to: '/portal', label: 'Home' },
  { to: '/portal/report', label: 'Report', children: reportSectionLinks },
  { to: '/portal/roadmap', label: 'Road map' },
  { to: '/portal/journal', label: 'Journal' },
  { to: '/portal/community', label: 'Community' },
  { to: '/portal/profile', label: 'Profile' }
] as const;

function PortalLayout() {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-800 bg-slate-900/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo variant="compact" />
            <div>
              <p className="text-sm font-semibold text-slate-200">re-imagined.me Portal</p>
              <p className="text-xs text-slate-400">Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-300 hover:text-emerald-300"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 lg:flex-row">
        <nav className="flex flex-row gap-2 overflow-auto rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm lg:flex-col lg:gap-3">
          {portalLinks.map((link) => {
            const isReportLink = link.to === '/portal/report';

            return (
              <div key={link.to} className="flex flex-col gap-1">
                <NavLink
                  to={link.to}
                  end={link.to === '/portal'}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-2 font-medium transition ${
                      isActive ? 'bg-emerald-500/20 text-emerald-200' : 'text-slate-300 hover:text-white'
                    }`
                  }
                >
                  {link.label}
                </NavLink>

                {isReportLink && link.children && (
                  <div className="ml-2 flex flex-col gap-1 border-l border-slate-800 pl-2">
                    {link.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={`/portal/report/${child.to}`}
                        className={({ isActive }) =>
                          `rounded-lg px-3 py-2 text-left font-medium transition ${
                            isActive ? 'bg-emerald-500/10 text-emerald-200' : 'text-slate-400 hover:text-white'
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <section className="flex-1 rounded-3xl border border-slate-800 bg-slate-950/60 p-6 shadow-2xl shadow-emerald-500/5">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

export default PortalLayout;
