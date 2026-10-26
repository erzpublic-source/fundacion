import { forwardRef, useEffect, useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { RECAPTCHA_SITE_KEY } from '../../lib/recaptcha'

interface RecaptchaFieldProps {
  onChange: (token: string | null) => void
}

// Google's "normal" reCAPTCHA widget is a fixed 304px wide, which doesn't
// fit the available width inside some forms on narrow phones — it was
// overflowing and causing an odd horizontal scroll on the whole page.
// Starting "compact" (164px, always fits) and only switching to "normal"
// once the container is confirmed wide enough avoids that without any
// layout hacks (CSS transforms on a cross-origin iframe don't play nicely
// with click targets).
const NORMAL_SIZE_MIN_WIDTH_PX = 312

// Thin wrapper around react-google-recaptcha so every form (Contacto,
// Voluntariado, the event reservation drawer) renders the exact same widget
// from one place — ref forwarded so each form can call .reset() on submit.
const RecaptchaField = forwardRef<ReCAPTCHA, RecaptchaFieldProps>(function RecaptchaField({ onChange }, ref) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [useNormalSize, setUseNormalSize] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0
      if (width > 0) setUseNormalSize(width >= NORMAL_SIZE_MIN_WIDTH_PX)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef}>
      <ReCAPTCHA
        ref={ref}
        sitekey={RECAPTCHA_SITE_KEY}
        onChange={onChange}
        onExpired={() => onChange(null)}
        hl="es"
        size={useNormalSize ? 'normal' : 'compact'}
      />
    </div>
  )
})

export default RecaptchaField
