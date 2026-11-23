import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase env vars missing. Check that .env is in the project root with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart npm run dev.'
  )
}

// If an email link was invalid or expired, Supabase returns ?error=... / #error=...
// Send the user to the forgot-password page with a message instead of a 404.
if (typeof window !== 'undefined') {
  const raw = window.location.search + window.location.hash
  if (raw.includes('error_code=otp_expired') || raw.includes('error=access_denied')) {
    window.location.replace(
      window.location.origin + window.location.pathname + '#/forgot-password?expired=1'
    )
  }
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost',
  supabaseAnonKey || 'missing-key',
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
    },
  }
)

// When the user opens a password-reset link, send them to the reset page.
// Registered here (not in a React component) so the event can't be missed.
supabase.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') {
    window.location.hash = '#/reset-password'
  }
})