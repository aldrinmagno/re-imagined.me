import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { reportSectionLinks } from './report/ReportLayout';

const portalLinks = [
  { to: '/portal/report', label: 'Report', children: reportSectionLinks },
  { to: '/portal/inventory', label: 'Impact Inventory' },
  { to: '/portal/cv', label: 'CV Versions' },
  { to: '/portal/radar', label: 'Radar' },
  { to: '/portal/applications', label: 'Applications' },
  { to: '/portal/networking', label: 'Networking' },
  { to: '/portal/progress', label: 'Progress' },
  { to: '/portal/interview', label: 'Interview' },
  { to: '/portal/profile', label: 'Profile' }
] as const;

function PortalLayout() {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo variant="compact" />
            <div>
              <p className="text-sm font-semibold text-slate-900">re-imagined.me Portal</p>
              <p className="text-xs text-slate-600">Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-emerald-300 hover:text-emerald-700 hover:shadow-sm"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 lg:flex-row">
        <nav className="flex flex-row gap-2 overflow-auto text-sm lg:flex-col lg:gap-3">
          {portalLinks.map((link) => {
            const isReportLink = link.to === '/portal/report';

            return (
              <div key={link.to} className="flex flex-col gap-1">
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-2 font-medium transition ${
                      isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'text-slate-700 hover:text-slate-900'
                    }`
                  }
                >
                  {link.label}
                </NavLink>

                {isReportLink && link.children && (
                  <div className="ml-2 flex flex-col gap-1 border-l border-slate-200 pl-2">
                    {link.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={`/portal/report/${child.to}`}
                        className={({ isActive }) =>
                          `rounded-lg px-3 py-2 text-left font-medium transition ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                              : 'text-slate-600 hover:text-slate-900'
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

        <section className="flex-1">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

export default PortalLayout;
