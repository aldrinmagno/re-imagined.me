import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthPageLayout from '../components/AuthPageLayout';
import { getSupabaseClient } from '../lib/supabaseClient';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage('If that email exists in our system, we\'ll send password reset instructions shortly.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process your request right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageLayout
      title="Reset your password"
      subtitle="We\'ll email you a secure link to choose a new password."
      footer={
        <p>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
            Return to login
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-800">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-full border border-emerald-300 bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Sending instructions…' : 'Send reset link'}
        </button>
      </form>
    </AuthPageLayout>
  );
}

export default ForgotPassword;
