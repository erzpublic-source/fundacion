import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // This module is imported from the app root (AdminAuthContext wraps the
  // whole tree, not just /admin routes), so it runs on every public page —
  // it must never throw synchronously here, or a missing/misconfigured
  // Supabase project would take down the entire public site, not just the
  // admin panel. Falling back to a syntactically valid placeholder lets
  // createClient() succeed; any real request against it simply fails at
  // call time (handled by the admin auth/data error states) instead of
  // crashing on load.
  console.error(
    'Faltan las variables de entorno VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
      'El panel de administrador no podrá conectarse hasta configurarlas.',
  )
}

// The anon/publishable key is safe to ship in client-side code by design —
// Supabase expects it here and relies on Row Level Security policies (set
// per table in the Supabase dashboard) to control what it can actually
// read or write, not on keeping the key secret.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
)
