import { CheckCircle, Map, TrendingUp } from 'lucide-react';

function SupportTiles() {
  return (
    <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-12">
          How re-imagined.me supports your next step
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Clarify your current position</h3>
            <p className="text-slate-600">We map your role, skills, and day-to-day responsibilities.</p>
          </div>

          <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
            <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="text-emerald-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Explore future-aligned paths</h3>
            <p className="text-slate-600">
              We highlight roles and emerging opportunities that fit your strengths and ambitions.
            </p>
          </div>

          <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
            <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Map className="text-amber-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Define your next steps</h3>
            <p className="text-slate-600">
              We outline a structured 90-day plan to move toward your next chapter.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SupportTiles;
