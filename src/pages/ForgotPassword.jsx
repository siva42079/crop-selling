import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ForgotPassword() {
  const [params] = useSearchParams();
  const expired = params.get('expired') === '1';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const clean = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(clean)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(clean, {
      redirectTo: (import.meta.env.VITE_SITE_URL || window.location.origin) + '/',
    });
    setLoading(false);
    // Rate-limit and network errors are shown; "no such user" is never revealed
    if (err && err.status === 429) {
      setError('Too many requests. Please wait a few minutes and try again.');
      return;
    }
    if (err && !err.status) {
      setError('Network problem. Please check your connection and try again.');
      return;
    }
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl bg-white p-8 shadow-card dark:bg-stone-900">
        <h1 className="text-2xl font-extrabold text-stone-800 dark:text-stone-100">Forgot password?</h1>

        {expired && !sent && (
          <p role="alert" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900 dark:bg-stone-800 dark:text-amber-200">
            That reset link has expired or was already used. Enter your email to get a new one.
          </p>
        )}

        {sent ? (
          <div className="mt-4" role="status">
            <p className="text-sm text-stone-600 dark:text-stone-300">
              If an account exists for <strong>{email.trim()}</strong>, we've sent a link to reset your password.
              Check your inbox and spam folder. Open the link once, in this same browser.
            </p>
            <Link to="/" className="mt-6 inline-block rounded-full bg-brand-700 px-6 py-3 font-extrabold text-white hover:bg-brand-800">
              Back to Home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4" noValidate>
            <p className="text-sm text-stone-500">Enter your email and we'll send you a reset link.</p>
            <label htmlFor="fp-email" className="mt-5 block text-sm font-bold">Email</label>
            <input
              id="fp-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-3 dark:border-stone-700 dark:bg-stone-950"
              placeholder="you@example.com"
              required
            />
            {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-full bg-brand-700 px-6 py-3 font-extrabold text-white hover:bg-brand-800 disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <Link to="/" className="mt-4 block text-center text-sm font-semibold text-brand-700 hover:underline">
              Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}