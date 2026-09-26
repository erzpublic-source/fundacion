import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import AdminLayout from '../components/AdminLayout'
import AdminSubmitButton from '../components/AdminSubmitButton'
import PasswordField from '../components/PasswordField'
import Toast from '../components/Toast'
import { useAdminAuth } from '../AdminAuthContext'
import '../AdminAuth.css'
import '../AdminShared.css'
import '../pages/EventForm.css'
import './Configuracion.css'

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1.2l1.9 4.1 4.4.5-3.3 3 .9 4.3L8 11l-3.9 2.1.9-4.3-3.3-3 4.4-.5L8 1.2Z" />
    </svg>
  )
}

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

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

// TODO(Supabase): mock-only shape for the "Datos de pago" card. Maps to a
// `payment_config` table (a single row, or one row per org if multi-tenant
// ever matters): { id, nequi_number, bre_b_key, account_holder, updated_at }.
// Replace this local state with a `select` on mount and an `upsert` on save.
interface PaymentConfig {
  nequiNumber: string
  breBKey: string
  accountHolder: string
}

export default function Configuracion() {
  const { session, changePassword } = useAdminAuth()

  // ---------- Datos de pago ----------
  const [payment, setPayment] = useState<PaymentConfig>({ nequiNumber: '', breBKey: '', accountHolder: '' })
  const [savingPayment, setSavingPayment] = useState(false)
  const canSavePayment = Boolean(payment.nequiNumber.trim() || payment.breBKey.trim() || payment.accountHolder.trim())

  // ---------- Perfil / Cuenta — cambiar contraseña ----------
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPasswordError, setCurrentPasswordError] = useState<string | undefined>()
  const [matchTouched, setMatchTouched] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const requirements = useMemo(
    () => [
      { label: 'Mínimo 8 caracteres', met: newPassword.length >= 8 },
      { label: 'Al menos una mayúscula', met: /[A-Z]/.test(newPassword) },
      { label: 'Al menos una minúscula', met: /[a-z]/.test(newPassword) },
      { label: 'Al menos un carácter especial (!@#$%)', met: /[!@#$%]/.test(newPassword) },
    ],
    [newPassword],
  )

  const allRequirementsMet = requirements.every((r) => r.met)
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword
  const canSubmitPassword = currentPassword.length > 0 && allRequirementsMet && passwordsMatch

  function resetPasswordForm() {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setCurrentPasswordError(undefined)
    setMatchTouched(false)
  }

  async function handleSavePayment(event: FormEvent) {
    event.preventDefault()
    if (savingPayment || !canSavePayment) return

    setSavingPayment(true)
    // TODO(Supabase): supabase.from('payment_config').upsert({ nequi_number, bre_b_key, account_holder }).
    await wait(700)
    setSavingPayment(false)
    setToastMessage('Datos de pago actualizados')
  }

  async function handleSubmitPassword(event: FormEvent) {
    event.preventDefault()
    if (savingPassword || !canSubmitPassword) return

    setSavingPassword(true)
    const result = await changePassword(currentPassword, newPassword)
    setSavingPassword(false)

    if (result.error) {
      setCurrentPasswordError('La contraseña actual no es correcta')
      return
    }

    resetPasswordForm()
    setToastMessage('Contraseña actualizada correctamente')
  }

  return (
    <AdminLayout>
      <div className="configuracion-page">
      <p className="event-form__title configuracion__page-title">Configuración</p>
      <p className="event-form__subtitle">Gestiona tu cuenta, datos de pago y contacto de soporte.</p>

      <div className="configuracion__columns">
        <section className="event-form__card configuracion__profile-card">
          <div className="configuracion__card-heading">
            <h2>Perfil / Cuenta</h2>
            <p>Información básica de acceso al panel administrativo.</p>
          </div>

          <div className="admin-field">
            <label htmlFor="config-email">Correo electrónico</label>
            <div className="admin-field__control admin-field__control--disabled">
              <input id="config-email" type="email" value={session?.email ?? ''} disabled readOnly />
            </div>
          </div>

          <hr className="configuracion__divider" />

          <form onSubmit={handleSubmitPassword} noValidate>
            <h3 className="configuracion__subheading">Cambiar contraseña</h3>

            <PasswordField
              label="Ingresa la contraseña actual"
              value={currentPassword}
              onChange={(value) => {
                setCurrentPassword(value)
                setCurrentPasswordError(undefined)
              }}
              autoComplete="current-password"
              disabled={savingPassword}
              error={currentPasswordError}
            />

            <PasswordField
              label="Nueva contraseña"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              disabled={savingPassword}
            />

            <PasswordField
              label="Confirmar contraseña"
              value={confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value)
                setMatchTouched(true)
              }}
              autoComplete="new-password"
              disabled={savingPassword}
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

            <div className="configuracion__password-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={resetPasswordForm}
                disabled={savingPassword}
              >
                Cancelar
              </button>
              <AdminSubmitButton
                loading={savingPassword}
                disabled={!canSubmitPassword}
                idleLabel="Guardar contraseña"
                loadingLabel="Guardando..."
              />
            </div>
          </form>
        </section>

        <form className="event-form__card" onSubmit={handleSavePayment} noValidate>
          <div className="configuracion__card-heading">
            <h2>Datos de pago</h2>
            <p>Información que se mostrará a los usuarios en el momento de reservar una entrada de pago.</p>
          </div>

          <div className="admin-field">
            <label htmlFor="config-nequi">Número Nequi</label>
            <div className="admin-field__control">
              <input
                id="config-nequi"
                type="text"
                inputMode="numeric"
                placeholder="3001234567"
                value={payment.nequiNumber}
                onChange={(e) => setPayment((p) => ({ ...p, nequiNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                disabled={savingPayment}
              />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="config-breb">Llave Bre-B</label>
            <div className="admin-field__control">
              <input
                id="config-breb"
                type="text"
                placeholder="Ingresa tu llave Bre-B"
                value={payment.breBKey}
                onChange={(e) => setPayment((p) => ({ ...p, breBKey: e.target.value }))}
                disabled={savingPayment}
              />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="config-holder">Nombre del titular</label>
            <div className="admin-field__control">
              <input
                id="config-holder"
                type="text"
                placeholder="Nombre como aparece en el comprobante"
                value={payment.accountHolder}
                onChange={(e) => setPayment((p) => ({ ...p, accountHolder: e.target.value }))}
                disabled={savingPayment}
              />
            </div>
          </div>

          <div className="configuracion__note">
            <StarIcon />
            Esta información se mostrará a los usuarios en el momento de reservar una entrada de pago.
          </div>

          <AdminSubmitButton
            loading={savingPayment}
            disabled={!canSavePayment}
            idleLabel="Guardar cambios"
            loadingLabel="Guardando..."
          />
        </form>
      </div>
      </div>

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </AdminLayout>
  )
}
