import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface AdminSession {
  email: string
}

export type AuthErrorCode = 'invalid-email' | 'invalid-credentials' | 'network-error'

export type ChangePasswordErrorCode = 'wrong-current-password'

export interface ChangePasswordResult {
  error: ChangePasswordErrorCode | null
}

export interface AuthResult {
  error: AuthErrorCode | null
}

interface AdminAuthContextValue {
  session: AdminSession | null
  /** True until the real Supabase session has been read once. */
  initializing: boolean
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>
  resetPasswordForEmail: (email: string) => Promise<AuthResult>
  updateUser: (newPassword: string) => Promise<AuthResult>
  /**
   * Used by the "Cambiar contraseña" form in Configuración, where (unlike
   * the forgot-password flow above) the admin must prove they know the
   * current password before setting a new one. Supabase's updateUser()
   * doesn't check the current password itself, so this re-verifies it with
   * a throwaway signInWithPassword call first.
   */
  changePassword: (currentPassword: string, newPassword: string) => Promise<ChangePasswordResult>
  signOut: () => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

function toAdminSession(email: string | undefined): AdminSession | null {
  return email ? { email } : null
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(toAdminSession(data.session?.user.email))
      setInitializing(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(toAdminSession(nextSession?.user.email))
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const signInWithPassword = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      return { error: 'invalid-email' }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) return { error: 'invalid-credentials' }
      return { error: null }
    } catch {
      return { error: 'network-error' }
    }
  }, [])

  const resetPasswordForEmail = useCallback(async (email: string): Promise<AuthResult> => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      return { error: 'invalid-email' }
    }

    try {
      // Deliberately ignore the result — never reveal whether the email is
      // registered, Supabase itself returns success regardless.
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}admin/nueva-contrasena`,
      })
      return { error: null }
    } catch {
      return { error: 'network-error' }
    }
  }, [])

  const updateUser = useCallback(async (newPassword: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) return { error: 'network-error' }
      return { error: null }
    } catch {
      return { error: 'network-error' }
    }
  }, [])

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<ChangePasswordResult> => {
      if (!session) return { error: 'wrong-current-password' }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: session.email,
        password: currentPassword,
      })
      if (verifyError) return { error: 'wrong-current-password' }

      await supabase.auth.updateUser({ password: newPassword })
      return { error: null }
    },
    [session],
  )

  const signOut = useCallback(() => {
    supabase.auth.signOut()
  }, [])

  const value = useMemo<AdminAuthContextValue>(
    () => ({ session, initializing, signInWithPassword, resetPasswordForEmail, updateUser, changePassword, signOut }),
    [session, initializing, signInWithPassword, resetPasswordForEmail, updateUser, changePassword, signOut],
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
