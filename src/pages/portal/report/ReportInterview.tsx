import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useReportContext } from '../../../components/report/ReportLayout';
import hiringNorms from '../../../data/hiring_norms.json';
import { getSupabaseClient } from '../../../lib/supabaseClient';
import type { HiringNormCard, HiringNormsByCountry } from '../../../types/hiringNorms';

function ReportInterview() {
  const { user } = useAuth();
  const { reportContent } = useReportContext();
  const interview = reportContent.interview;
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const normsByCountry = hiringNorms as HiringNormsByCountry;
  const countryOptions = useMemo(() => Object.keys(normsByCountry), [normsByCountry]);
  const currentNorms: HiringNormCard[] = normsByCountry[selectedCountry] ?? [];

  useEffect(() => {
    const storedCountry = window.localStorage.getItem('hiringNormsCountry');
    if (storedCountry && normsByCountry[storedCountry]) {
      setSelectedCountry(storedCountry);
    }
  }, [normsByCountry]);

  useEffect(() => {
    window.localStorage.setItem('hiringNormsCountry', selectedCountry);
  }, [selectedCountry]);

  const handleFeedback = async (cardKey: string, sentiment: 'helpful' | 'not_helpful') => {
    if (!user) {
      setFeedbackError('Log in to save feedback.');
      return;
    }
    setFeedbackError('');
    setFeedbackMessage('');
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('hiring_norms_feedback').insert({
        user_id: user.id,
        country_code: selectedCountry,
        card_key: cardKey,
        sentiment
      });
      if (error) {
        throw error;
      }
      setFeedbackMessage('Thanks for the feedback.');
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Unable to save feedback.');
    }
  };

  if (!interview) {
    return (
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Interview support</p>
          <h2 className="text-lg font-semibold text-slate-900">How to describe yourself in interviews</h2>
          <p className="text-sm text-slate-700">Interview guidance will show up once your report content is ready.</p>
        </div>
        <p className="text-sm text-slate-700">No interview guidance available yet.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Interview support</p>
          <h2 className="text-lg font-semibold text-slate-900">How to describe yourself in interviews</h2>
          <p className="text-sm text-slate-700">
            Use these talking points as a calm, confident way to frame your experience and direction.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-slate-800">
          {interview.pitches.map((pitch) => (
            <li key={pitch} className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" aria-hidden />
              <span className="leading-snug">{pitch}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-2">
          <h3 className="text-base font-semibold text-slate-900">Talking points for interviews</h3>
          <p className="text-sm text-slate-700">
            Keep these in your back pocket to connect your past work to where you&apos;re headed next.
          </p>
          <ul className="space-y-2 text-sm text-slate-800">
            {interview.talkingPoints.map((point) => (
              <li key={point} className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" aria-hidden />
                <span className="leading-snug">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Hiring norms</p>
          <h2 className="text-lg font-semibold text-slate-900">Country-specific guidance for interviews</h2>
          <p className="text-sm text-slate-700">
            Select the country for this application to see tailored interview norms and etiquette.
          </p>
        </div>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-700">Country</span>
          <select
            value={selectedCountry}
            onChange={(event) => setSelectedCountry(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>
        {feedbackMessage ? <p className="text-xs text-emerald-600">{feedbackMessage}</p> : null}
        {feedbackError ? <p className="text-xs text-rose-600">{feedbackError}</p> : null}
        {currentNorms.length === 0 ? (
          <p className="text-sm text-slate-600">No hiring norms available for this country yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {currentNorms.map((card) => (
              <article key={card.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-700">{card.body}</p>
                <div className="mt-3 flex gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => handleFeedback(card.key, 'helpful')}
                    className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-emerald-600 transition hover:border-emerald-300 hover:text-emerald-700"
                  >
                    Helpful
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback(card.key, 'not_helpful')}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                  >
                    Not helpful
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">LinkedIn headline suggestion</p>
          <h2 className="text-lg font-semibold text-slate-900">Use this as a starting point</h2>
          <p className="text-sm text-slate-700">
            A sample headline crafted for this profile. Swap in your own role, target focus, or proof points when you update it later.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-800">
          <p className="font-semibold text-slate-900">{interview.headline || 'Personalized headline coming soon.'}</p>
          <p className="mt-2 text-xs text-emerald-800">Loaded from your saved report data.</p>
        </div>
      </section>
    </div>
  );
}

export default ReportInterview;
