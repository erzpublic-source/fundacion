import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AdminAuthLayout from '../components/AdminAuthLayout'
import { maskEmail, useAdminAuth } from '../AdminAuthContext'
import '../AdminAuth.css'

function CheckIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.5l2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M14 8H2M7 3 2 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const RESEND_COOLDOWN_S = 30

export default function EnlaceEnviado() {
  const { resetPasswordForEmail } = useAdminAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const email = (location.state as { email?: string } | null)?.email ?? null

  const [cooldown, setCooldown] = useState(0)
  const [resending, setResending] = useState(false)

  // Reaching this screen without an email in state means it wasn't
  // navigated to from the "recuperar contraseña" flow (e.g. a stale
  // bookmark) — there's nothing useful to resend to, so send them back.
  useEffect(() => {
    if (!email) navigate('/admin/recuperar-contrasena', { replace: true })
  }, [email, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
  }, [cooldown])

  if (!email) return null

  async function handleResend() {
    if (resending || cooldown > 0) return
    setResending(true)
    await resetPasswordForEmail(email!)
    setResending(false)
    setCooldown(RESEND_COOLDOWN_S)
  }

  return (
    <AdminAuthLayout subtitle="¡Enlace enviado!">
      <div className="admin-success">
        <span className="admin-success__icon">
          <CheckIcon />
        </span>

        <p>
          Revisa tu bandeja de entrada en <strong>{maskEmail(email)}</strong>. El enlace expira en 30 minutos.
        </p>
        <p className="admin-success__note">
          Si no recibes el correo en unos minutos, revisa la carpeta de spam o solicita un nuevo enlace.
        </p>

        <button type="button" className="admin-resend" onClick={handleResend} disabled={resending || cooldown > 0}>
          {resending ? 'Reenviando...' : cooldown > 0 ? `Reenviar enlace (${cooldown}s)` : 'Reenviar enlace'}
        </button>

        <hr className="admin-success__divider" />

        <Link to="/admin/login" className="admin-link admin-link--centered">
          <ArrowLeftIcon /> Volver al inicio de sesión
        </Link>
      </div>
    </AdminAuthLayout>
  )
}
