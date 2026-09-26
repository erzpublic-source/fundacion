import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

const SESSION_STORAGE_KEY = 'undiamas_admin_session'

// ---------------------------------------------------------------------------
// Mock credentials — there is no backend yet, so this stands in for a real
// user table. Use these to sign in during development/QA:
//   email:    admin@undiamas.org
//   password: FundacionUDM2026!
// To rehearse the "temporary connection error" state, sign in with
// network-error@test.com (any password) — this is a deliberate test hook,
// not a real account, and should be removed once Supabase is wired up.
// ---------------------------------------------------------------------------
const MOCK_ADMIN_EMAIL = 'admin@undiamas.org'
const MOCK_ADMIN_PASSWORD = 'FundacionUDM2026!'
const MOCK_NETWORK_ERROR_EMAIL = 'network-error@test.com'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MOCK_LATENCY_MS = 900

export interface AdminSession {
  email: string
}

export type AuthErrorCode = 'invalid-email' | 'invalid-credentials' | 'network-error'

export interface AuthResult {
  error: AuthErrorCode | null
}

interface AdminAuthContextValue {
  session: AdminSession | null
  /** True until the persisted session has been read from storage once. */
  initializing: boolean
  // TODO(Supabase): replace this mock with supabase.auth.signInWithPassword({ email, password }).
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>
  // TODO(Supabase): replace this mock with supabase.auth.resetPasswordForEmail(email, { redirectTo }).
  resetPasswordForEmail: (email: string) => Promise<AuthResult>
  // TODO(Supabase): replace this mock with supabase.auth.updateUser({ password: newPassword }).
  updateUser: (newPassword: string) => Promise<AuthResult>
  // TODO(Supabase): replace this mock with supabase.auth.signOut().
  signOut: () => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function readStoredSession(): AdminSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AdminSession
    return parsed?.email ? parsed : null
  } catch {
    return null
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [initializing, setInitializing] = useState(true)

  // TODO(Supabase): replace with supabase.auth.getSession() + onAuthStateChange
  // to hydrate/subscribe to the real session instead of reading localStorage.
  useEffect(() => {
    setSession(readStoredSession())
    setInitializing(false)
  }, [])

  const persistSession = useCallback((next: AdminSession | null) => {
    setSession(next)
    if (next) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next))
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY)
    }
  }, [])

  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!EMAIL_PATTERN.test(email.trim())) {
        return { error: 'invalid-email' }
      }

      await wait(MOCK_LATENCY_MS)

      if (email.trim().toLowerCase() === MOCK_NETWORK_ERROR_EMAIL) {
        return { error: 'network-error' }
      }

      const isValid = email.trim().toLowerCase() === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASSWORD
      if (!isValid) {
        return { error: 'invalid-credentials' }
      }

      persistSession({ email: email.trim() })
      return { error: null }
    },
    [persistSession],
  )

  const resetPasswordForEmail = useCallback(async (email: string): Promise<AuthResult> => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      return { error: 'invalid-email' }
    }

    await wait(MOCK_LATENCY_MS)

    if (email.trim().toLowerCase() === MOCK_NETWORK_ERROR_EMAIL) {
      return { error: 'network-error' }
    }

    // Deliberately succeeds regardless of whether the email is registered —
    // never reveal account existence through this endpoint.
    return { error: null }
  }, [])

  const updateUser = useCallback(async (_newPassword: string): Promise<AuthResult> => {
    await wait(MOCK_LATENCY_MS)
    return { error: null }
  }, [])

  const signOut = useCallback(() => {
    persistSession(null)
  }, [persistSession])

  const value = useMemo<AdminAuthContextValue>(
    () => ({ session, initializing, signInWithPassword, resetPasswordForEmail, updateUser, signOut }),
    [session, initializing, signInWithPassword, resetPasswordForEmail, updateUser, signOut],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  return ctx
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split('@')
  if (!user || !domain) return email
  const visible = user.slice(0, 1)
  return `${visible}${'*'.repeat(Math.max(3, user.length - 1))}@${domain}`
}
