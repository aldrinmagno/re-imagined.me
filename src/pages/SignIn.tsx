import { FormEvent, useState } from 'react';

import { getSupabaseClient } from '../lib/supabaseClient';

type SubmissionState = 'idle' | 'submitted';

function SignIn() {
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name')?.toString().trim() ?? '';
    const email = formData.get('email')?.toString().trim() ?? '';
    const interests = formData.get('interests')?.toString().trim() ?? '';

    if (!name || !email) {
      setError('Please provide both your name and email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const { error: submissionError } = await supabase.from('mailing_list_signups').insert({
        name,
        email,
        interests: interests || null
      });

      if (submissionError) {
        console.error('Failed to save mailing list signup', submissionError);
        setError('We could not save your subscription. Please try again.');
        return;
      }

      form.reset();
      setSubmissionState('submitted');
    } catch (supabaseError) {
      console.error('Error saving mailing list signup', supabaseError);
      setError('We are having trouble connecting right now. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClasses =
    'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/50 placeholder:text-slate-400';

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
      </div>
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-300 bg-white p-10 shadow-2xl shadow-emerald-200/20">
          <h1 className="text-4xl font-bold text-slate-900">Happening soon!</h1>
          <h2 className="mt-4 text-2xl font-semibold text-emerald-600">
            Join the re-imagined.me mailing list
          </h2>
          <p className="mt-4 text-lg text-slate-700">
            Be the first to hear about new resources, community events, and updates from re-imagined.me.
            Sign up below and we&apos;ll keep you in the loop.
          </p>

          {submissionState === 'submitted' ? (
            <div className="mt-10 rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-700 shadow-inner shadow-emerald-200/40">
              <h2 className="text-2xl font-semibold">You&apos;re on the list!</h2>
              <p className="mt-3 leading-relaxed">
                Thanks for subscribing. We&apos;ll reach out soon with updates about re-imagined.me and upcoming announcements.
              </p>
            </div>
          ) : (
            <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={fieldClasses}
                  placeholder="Alex Johnson"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={fieldClasses}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="interests" className="mb-2 block text-sm font-medium text-slate-700">
                  What are you most interested in hearing about?
                </label>
                <textarea
                  id="interests"
                  name="interests"
                  rows={3}
                  className={fieldClasses}
                  placeholder="e.g. designing my next chapter, community events, coaching opportunities"
                />
                <p className="mt-2 text-sm text-slate-600">
                  Share anything that will help us send you the most relevant updates.
                </p>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-200/30 transition hover:shadow-xl hover:shadow-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-200/40 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Subscribing…' : 'Subscribe'}
              </button>

              <p className="text-sm text-slate-600">
                We respect your inbox. You can unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default SignIn;
