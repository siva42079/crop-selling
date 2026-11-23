import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(null); // null = checking, true = valid link, false = invalid
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // The recovery link signs the user in temporarily; check that session exists
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) return setError(err.message || 'Could not update password. Please try again.');
    setDone(true);
    await supabase.auth.signOut(); // make the user log in with the new password
    setTimeout(() => navigate('/', { replace: true }), 2500);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl bg-white p-8 shadow-card dark:bg-stone-900">
        <h1 className="text-2xl font-extrabold text-stone-800 dark:text-stone-100">Set a new password</h1>

        {ready === null && <p className="mt-4 text-sm text-stone-500">Checking your link…</p>}

        {ready === false && (
          <div className="mt-4" role="alert">
            <p className="text-sm text-stone-600 dark:text-stone-300">
              This reset link is invalid or has expired. Please request a new one.
            </p>
            <Link to="/forgot-password" className="mt-6 inline-block rounded-full bg-brand-700 px-6 py-3 font-extrabold text-white hover:bg-brand-800">
              Request new link
            </Link>
          </div>
        )}

        {ready && done && (
          <p role="status" className="mt-4 text-sm font-semibold text-brand-700">
            Password updated. Redirecting you to the home page — please log in with your new password.
          </p>
        )}

        {ready && !done && (
          <form onSubmit={handleSubmit} className="mt-4" noValidate>
            <label htmlFor="rp-pass" className="block text-sm font-bold">New password</label>
            <input
              id="rp-pass"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-3 dark:border-stone-700 dark:bg-stone-950"
              required
            />
            <label htmlFor="rp-confirm" className="mt-4 block text-sm font-bold">Confirm password</label>
            <input
              id="rp-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-3 dark:border-stone-700 dark:bg-stone-950"
              required
            />
            {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-full bg-brand-700 px-6 py-3 font-extrabold text-white hover:bg-brand-800 disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}