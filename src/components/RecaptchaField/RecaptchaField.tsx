import { forwardRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { RECAPTCHA_SITE_KEY } from '../../lib/recaptcha'

interface RecaptchaFieldProps {
  onChange: (token: string | null) => void
}

// Thin wrapper around react-google-recaptcha so every form (Contacto,
// Voluntariado, the event reservation drawer) renders the exact same widget
// from one place — ref forwarded so each form can call .reset() on submit.
const RecaptchaField = forwardRef<ReCAPTCHA, RecaptchaFieldProps>(function RecaptchaField({ onChange }, ref) {
  return (
    <ReCAPTCHA ref={ref} sitekey={RECAPTCHA_SITE_KEY} onChange={onChange} onExpired={() => onChange(null)} hl="es" />
  )
})

export default RecaptchaField
