import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AdminAuthLayout from '../components/AdminAuthLayout'
import AdminSubmitButton from '../components/AdminSubmitButton'
import PasswordField from '../components/PasswordField'
import { useAdminAuth } from '../AdminAuthContext'
import '../AdminAuth.css'

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" />
      <path d="M6.5 10.2l2.3 2.3 4.7-4.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M10 2 18.5 17H1.5L10 2Z" strokeLinejoin="round" />
      <path d="M10 8v4" strokeLinecap="round" />
      <circle cx="10" cy="14.3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { signInWithPassword, session } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [justReset] = useState(() => Boolean((location.state as { justReset?: boolean } | null)?.justReset))

  // Already signed in (e.g. reopened the tab) — no reason to show the form.
  useEffect(() => {
    if (session) navigate('/admin/eventos', { replace: true })
  }, [session, navigate])

  function validate(): boolean {
    let valid = true
    setEmailError(null)
    setPasswordError(null)

    if (email.trim() === '') {
      setEmailError('Ingresa tu correo electrónico.')
      valid = false
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError('Ingresa un correo válido.')
      valid = false
    }

    if (password === '') {
      setPasswordError('Ingresa tu contraseña.')
      valid = false
    }

    return valid
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    setFormError(null)
    if (!validate()) return

    setSubmitting(true)
    const { error } = await signInWithPassword(email, password)
    setSubmitting(false)

    if (error === 'invalid-email') {
      setEmailError('Ingresa un correo válido.')
      return
    }
    if (error === 'network-error') {
      setFormError('No pudimos conectar con el servidor. Verifica tu conexión e intenta nuevamente.')
      return
    }
    if (error === 'invalid-credentials') {
      setFormError('Credenciales inválidas. Verifica tu correo y contraseña.')
      return
    }

    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/admin/eventos'
    navigate(redirectTo, { replace: true })
  }

  return (
    <AdminAuthLayout subtitle="Panel de Administración">
      {justReset && (
        <div className="admin-alert admin-alert--success" role="status">
          <CheckIcon />
          <span>Tu contraseña se actualizó correctamente. Ingresa con tu nueva contraseña.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="admin-field">
          <label htmlFor="admin-email">Correo electrónico</label>
          <div className={`admin-field__control${emailError ? ' admin-field__control--error' : ''}`}>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              disabled={submitting}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'admin-email-error' : undefined}
            />
          </div>
          {emailError && (
            <p className="admin-field__error" id="admin-email-error" role="alert">
              {emailError}
            </p>
          )}
        </div>

        <PasswordField
          label="Contraseña"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          error={passwordError ?? undefined}
          disabled={submitting}
        />

        <Link to="/admin/recuperar-contrasena" className="admin-link">
          ¿Olvidaste tu contraseña?
        </Link>

        {formError && (
          <div className="admin-alert" role="alert" aria-live="assertive">
            <WarningIcon />
            <span>{formError}</span>
          </div>
        )}

        <AdminSubmitButton loading={submitting} idleLabel="Ingresar" loadingLabel="Ingresando..." />
      </form>
    </AdminAuthLayout>
  )
}
