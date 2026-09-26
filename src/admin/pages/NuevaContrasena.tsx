import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminAuthLayout from '../components/AdminAuthLayout'
import AdminSubmitButton from '../components/AdminSubmitButton'
import PasswordField from '../components/PasswordField'
import { useAdminAuth } from '../AdminAuthContext'
import '../AdminAuth.css'

function CheckSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CrossSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" strokeLinecap="round" />
    </svg>
  )
}

interface Requirement {
  label: string
  met: boolean
}

export default function NuevaContrasena() {
  const { updateUser } = useAdminAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [matchTouched, setMatchTouched] = useState(false)

  const requirements: Requirement[] = useMemo(
    () => [
      { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
      { label: 'Al menos una mayúscula', met: /[A-Z]/.test(password) },
      { label: 'Al menos una minúscula', met: /[a-z]/.test(password) },
      { label: 'Al menos un carácter especial (!@#$%)', met: /[!@#$%]/.test(password) },
    ],
    [password],
  )

  const allRequirementsMet = requirements.every((r) => r.met)
  const passwordsMatch = password.length > 0 && password === confirmPassword
  const canSubmit = allRequirementsMet && passwordsMatch

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting || !canSubmit) return

    setSubmitting(true)
    await updateUser(password)
    setSubmitting(false)

    navigate('/admin/login', { state: { justReset: true } })
  }

  return (
    <AdminAuthLayout subtitle="Crear nueva contraseña">
      <form onSubmit={handleSubmit} noValidate>
        <PasswordField
          label="Nueva contraseña"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          disabled={submitting}
        />

        <PasswordField
          label="Confirmar contraseña"
          value={confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value)
            setMatchTouched(true)
          }}
          autoComplete="new-password"
          disabled={submitting}
          error={matchTouched && !passwordsMatch ? 'Las contraseñas no coinciden.' : undefined}
        />

        <div className="admin-requirements">
          <p className="admin-requirements__title">Requisitos de seguridad</p>
          {requirements.map((req) => (
            <span key={req.label} className={`admin-requirement admin-requirement--${req.met ? 'met' : 'unmet'}`}>
              {req.met ? <CheckSmallIcon /> : <CrossSmallIcon />}
              {req.label}
            </span>
          ))}
        </div>

        <AdminSubmitButton
          loading={submitting}
          disabled={!canSubmit}
          idleLabel="Restablecer contraseña"
          loadingLabel="Restableciendo..."
        />
      </form>
    </AdminAuthLayout>
  )
}
