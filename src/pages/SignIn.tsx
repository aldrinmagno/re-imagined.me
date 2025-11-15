import { FormEvent, useState } from 'react';

type SubmissionState = 'idle' | 'submitted';

function SignIn() {
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionState('submitted');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto bg-white shadow-sm rounded-2xl border border-slate-200 p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 center">
            Happening soon!
          </h1>
          <h2 className="text-2xl text-slate-900 mb-4">
            Join the re-imagined.me mailing list
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Be the first to hear about new resources, community events, and updates from
            re-imagined.me. Sign up below and we&apos;ll keep you in the loop.
          </p>

          {submissionState === 'submitted' ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
              <h2 className="text-2xl font-semibold mb-2">You&apos;re on the list!</h2>
              <p className="leading-relaxed">
                Thanks for subscribing. We&apos;ll reach out soon with updates about re-imagined.me and
                upcoming announcements. Talk to you soon!
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-base shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Alex Johnson"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-base shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="interests"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  What are you most interested in hearing about?
                </label>
                <textarea
                  id="interests"
                  name="interests"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-base shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="e.g. designing my next chapter, community events, coaching opportunities"
                />
                <p className="mt-2 text-sm text-slate-500">
                  Share anything that will help us send you the most relevant updates.
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Subscribe
              </button>

              <p className="text-sm text-slate-500">
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
