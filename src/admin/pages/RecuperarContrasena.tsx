import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminAuthLayout from '../components/AdminAuthLayout'
import AdminSubmitButton from '../components/AdminSubmitButton'
import { useAdminAuth } from '../AdminAuthContext'
import '../AdminAuth.css'

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

export default function RecuperarContrasena() {
  const { resetPasswordForEmail } = useAdminAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    setFormError(null)
    setEmailError(null)

    if (email.trim() === '') {
      setEmailError('Ingresa tu correo electrónico.')
      return
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError('Ingresa un correo válido.')
      return
    }

    setSubmitting(true)
    const { error } = await resetPasswordForEmail(email)
    setSubmitting(false)

    if (error === 'network-error') {
      setFormError('No pudimos conectar con el servidor. Intenta nuevamente en unos minutos.')
      return
    }

    navigate('/admin/enlace-enviado', { state: { email: email.trim() } })
  }

  return (
    <AdminAuthLayout subtitle="Recuperar contraseña" backLink={{ label: 'Volver al inicio de sesión', to: '/admin/login' }}>
      <p>Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="admin-field">
          <label htmlFor="recuperar-email">Correo electrónico</label>
          <div className={`admin-field__control${emailError ? ' admin-field__control--error' : ''}`}>
            <input
              id="recuperar-email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              disabled={submitting}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'recuperar-email-error' : undefined}
            />
          </div>
          {emailError && (
            <p className="admin-field__error" id="recuperar-email-error" role="alert">
              {emailError}
            </p>
          )}
        </div>

        {formError && (
          <div className="admin-alert" role="alert" aria-live="assertive">
            <WarningIcon />
            <span>{formError}</span>
          </div>
        )}

        <AdminSubmitButton loading={submitting} idleLabel="Enviar enlace" loadingLabel="Enviando..." />
      </form>
    </AdminAuthLayout>
  )
}
