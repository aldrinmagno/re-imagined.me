import { ReactNode } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import Logo from './Logo';

interface AssessmentLayoutProps {
  children: ReactNode;
}

const valueProps = [
  {
    title: 'Human-centered insight',
    description:
      'We surface the parts of your role that are growing in strategic value so you can double down on what matters.'
  },
  {
    title: 'Signals from the frontier',
    description:
      'Stay ahead with guidance on roles and opportunities emerging from AI, automation, and other inflection technologies.'
  },
  {
    title: 'Practical next moves',
    description:
      'Translate your strengths into a clear 90-day plan across projects, skills, and positioning.'
  }
];

const trustSignals = [
  'Private and secure — your answers are only used to generate your roadmap.',
  'Shaped with experienced operators, designers, and technologists.',
  'Built for professionals navigating fast-moving industries.'
];

function AssessmentLayout({ children }: AssessmentLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid flex-1 gap-12 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
          <aside className="space-y-10">
            <div className="flex items-center gap-3 text-slate-100/90">
              <Logo variant="compact" />
              <span className="rounded-full border border-slate-800/60 bg-slate-900/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
                Assessment preview
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Capture where you are now to design what comes next.
              </h1>
              <p className="text-base text-slate-300">
                This quick assessment maps your current role, ambitions, and preferences. We use it to tailor an actionable plan for your next chapter.
              </p>
            </div>

            <div className="space-y-6">
              {valueProps.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-5">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                    <Sparkles size={14} aria-hidden="true" />
                    {item.title}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-800/70 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <ShieldCheck size={18} aria-hidden="true" />
                Trust & privacy
              </div>
              <ul className="space-y-2 text-sm text-slate-400">
                {trustSignals.map((signal) => (
                  <li key={signal} className="leading-relaxed">
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <main className="flex items-start justify-center pb-10 lg:pb-0">
            <div className="w-full max-w-2xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AssessmentLayout;
