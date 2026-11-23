import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { supabase } from '../supabaseClient';

/** Login / register modal backed by Supabase Auth */
export default function LoginModal() {
  const { loginOpen, setLoginOpen, login, toast } = useShop();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Escape closes; reset form each time it opens
  useEffect(() => {
    if (!loginOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setLoginOpen(false);
    document.addEventListener('keydown', onKey);
    setErrors({});
    return () => document.removeEventListener('keydown', onKey);
  }, [loginOpen, setLoginOpen]);

  if (!loginOpen) return null;

  const validate = () => {
    const next = {};
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim());
    if (!isEmail) next.contact = 'Enter a valid email address.';
    if (tab === 'register' && name.trim().length < 3) next.name = 'Please enter your full name (min 3 characters).';
    if (password.length < 6) next.password = 'Password must be at least 6 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const finishLogin = (user, fallbackName) => {
    const displayName =
      user?.user_metadata?.full_name ||
      fallbackName ||
      (user?.email || '').split('@')[0].replace(/[^a-zA-Z ]/g, ' ') ||
      'Farmer';
    login({ name: displayName, id: user?.email || contact.trim() });
    toast(`Welcome, ${displayName.split(' ')[0]}! 🌱`);
    setLoginOpen(false);
    setName(''); setContact(''); setPassword('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const email = contact.trim();

    if (tab === 'register') {
      const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/+$/, '');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${appUrl}/`,
        },
      });
      setLoading(false);
      if (error) {
        setErrors({ form: error.message });
        return;
      }
      // Confirm-email ON: no session yet, user must click the link in the email
      if (!data.session) {
        toast('Account created! Check your email to confirm, then log in. 📧');
        setTab('login');
        setPassword('');
        setErrors({});
        return;
      }
      finishLogin(data.user, name.trim());
      return;
    }

    // Login
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErrors({
        form: error.message === 'Email not confirmed'
          ? 'Please confirm your email first (check your inbox and spam folder).'
          : error.message === 'Invalid login credentials'
            ? 'Incorrect email or password.'
            : error.message,
      });
      return;
    }
    finishLogin(data.user);
  };

  const inputCls = (hasError) =>
    `h-12 w-full rounded-xl border-2 bg-white px-4 text-sm font-medium outline-none transition placeholder:text-stone-400 focus:border-brand-600 dark:bg-stone-900 dark:text-stone-100 ${hasError ? 'border-red-400' : 'border-stone-200 dark:border-stone-700'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Login or register">
      {/* Backdrop */}
      <button type="button" aria-label="Close" onClick={() => setLoginOpen(false)} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

      <div className="relative z-10 max-h-[95vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-stone-900 sm:rounded-3xl">
        <button type="button" onClick={() => setLoginOpen(false)} aria-label="Close login dialog" className="absolute right-4 top-4 rounded-full p-2 text-stone-400 transition hover:bg-stone-100 dark:hover:bg-stone-800">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
        </button>

        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-2xl" aria-hidden="true">🌱</span>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-white">Farmer Account</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">Order faster, track easily, get expert advice.</p>
          </div>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Login or register" className="mt-5 grid grid-cols-2 rounded-2xl bg-stone-100 p-1 dark:bg-stone-800">
          {[['login', 'Login'], ['register', 'Register']].map(([key, label]) => (
            <button key={key} role="tab" aria-selected={tab === key} onClick={() => { setTab(key); setErrors({}); }} className={`h-11 rounded-xl text-sm font-extrabold transition ${tab === key ? 'bg-white text-brand-800 shadow dark:bg-stone-900 dark:text-brand-300' : 'text-stone-500 dark:text-stone-400'}`}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} noValidate className="mt-4 space-y-3">
          {tab === 'register' && (
            <div>
              <label htmlFor="reg-name" className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Full Name</label>
              <input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Venkatesh Reddy" className={`mt-1 ${inputCls(errors.name)}`} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'err-name' : undefined} />
              {errors.name && <p id="err-name" role="alert" className="mt-1 text-xs font-semibold text-red-600">{errors.name}</p>}
            </div>
          )}
          <div>
            <label htmlFor="contact" className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Email</label>
            <input id="contact" type="email" value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="email" placeholder="name@email.com" className={`mt-1 ${inputCls(errors.contact)}`} aria-invalid={!!errors.contact} aria-describedby={errors.contact ? 'err-contact' : undefined} />
            {errors.contact && <p id="err-contact" role="alert" className="mt-1 text-xs font-semibold text-red-600">{errors.contact}</p>}
          </div>
          <div>
            <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={tab === 'register' ? 'new-password' : 'current-password'} placeholder="Minimum 6 characters" className={`mt-1 ${inputCls(errors.password)}`} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'err-password' : undefined} />
            {errors.password && <p id="err-password" role="alert" className="mt-1 text-xs font-semibold text-red-600">{errors.password}</p>}

            {/* Forgot password link (login tab only) */}
            {tab === 'login' && (
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  onClick={() => setLoginOpen(false)}
                  className="text-xs font-bold text-brand-700 hover:underline dark:text-brand-300"
                >
                  Forgot password?
                </Link>
              </div>
            )}
          </div>

          {errors.form && <p role="alert" className="text-sm font-semibold text-red-600">{errors.form}</p>}

          <button type="submit" disabled={loading} className="h-12 w-full rounded-2xl bg-brand-700 text-base font-extrabold text-white transition hover:bg-brand-800 active:scale-[0.98] disabled:opacity-60">
            {loading ? 'Please wait…' : tab === 'login' ? 'Login →' : 'Create Account →'}
          </button>
        </form>

        <p className="mt-3 text-center text-[11px] text-stone-400">
          By continuing you agree to our <a href="#terms" className="underline">Terms</a> &amp; <a href="#privacy" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
