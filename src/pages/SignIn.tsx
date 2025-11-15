import { FormEvent, useState } from 'react';

type SubmissionState = 'idle' | 'submitted';

function SignIn() {
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionState('submitted');
  };

  const fieldClasses =
    'w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-base text-slate-100 shadow-sm transition focus:border-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-200/40 placeholder:text-slate-400';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-emerald-200/10 backdrop-blur-lg">
          <h1 className="text-4xl font-bold text-white">Happening soon!</h1>
          <h2 className="mt-4 text-2xl font-semibold text-emerald-200">
            Join the re-imagined.me mailing list
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Be the first to hear about new resources, community events, and updates from re-imagined.me.
            Sign up below and we&apos;ll keep you in the loop.
          </p>

          {submissionState === 'submitted' ? (
            <div className="mt-10 rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-6 text-emerald-100 shadow-inner shadow-emerald-200/10">
              <h2 className="text-2xl font-semibold">You&apos;re on the list!</h2>
              <p className="mt-3 leading-relaxed">
                Thanks for subscribing. We&apos;ll reach out soon with updates about re-imagined.me and upcoming announcements.
              </p>
            </div>
          ) : (
            <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
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
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
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
                <label htmlFor="interests" className="mb-2 block text-sm font-medium text-slate-300">
                  What are you most interested in hearing about?
                </label>
                <textarea
                  id="interests"
                  name="interests"
                  rows={3}
                  className={fieldClasses}
                  placeholder="e.g. designing my next chapter, community events, coaching opportunities"
                />
                <p className="mt-2 text-sm text-slate-400">
                  Share anything that will help us send you the most relevant updates.
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300 px-4 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-emerald-200/30 transition hover:shadow-xl hover:shadow-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
              >
                Subscribe
              </button>

              <p className="text-sm text-slate-400">
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
