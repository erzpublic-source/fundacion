import { useCallback, useEffect, useRef, useState } from 'react'
import { useAdminAuth } from '../AdminAuthContext'
import ConfirmDialog from './ConfirmDialog'

// Total idle budget before the session closes: 4 minutes of silence, then a
// 1 minute countdown warning (see COUNTDOWN_SECONDS) — 5 minutes altogether.
const IDLE_WARNING_AFTER_MS = 4 * 60 * 1000
const COUNTDOWN_SECONDS = 60

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'] as const

// Wraps every authenticated admin screen (mounted once, inside
// ProtectedRoute) so a session left open and unattended — a very real
// scenario for shared/public computers — doesn't stay signed in forever.
// While the warning is showing, ordinary activity (mouse/keyboard/scroll) is
// deliberately ignored: only the dialog's own buttons (or letting the
// countdown run out) resolve it, so a stray cursor movement while reading
// the warning can't silently dismiss it.
export default function SessionIdleGuard() {
  const { signOut } = useAdminAuth()
  const [warning, setWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS)

  const idleTimerRef = useRef<number | undefined>(undefined)
  const countdownIntervalRef = useRef<number | undefined>(undefined)

  const clearTimers = useCallback(() => {
    window.clearTimeout(idleTimerRef.current)
    window.clearInterval(countdownIntervalRef.current)
  }, [])

  const startIdleTimer = useCallback(() => {
    window.clearTimeout(idleTimerRef.current)
    idleTimerRef.current = window.setTimeout(() => {
      setSecondsLeft(COUNTDOWN_SECONDS)
      setWarning(true)
    }, IDLE_WARNING_AFTER_MS)
  }, [])

  // The countdown itself, only ticking while the warning is visible.
  useEffect(() => {
    if (!warning) return

    countdownIntervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(countdownIntervalRef.current)
          signOut()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(countdownIntervalRef.current)
  }, [warning, signOut])

  // Activity listeners only reset the idle timer while the warning isn't
  // showing — see the component doc comment above for why.
  useEffect(() => {
    if (warning) return

    startIdleTimer()
    const onActivity = () => startIdleTimer()
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, onActivity))

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity))
      window.clearTimeout(idleTimerRef.current)
    }
  }, [warning, startIdleTimer])

  useEffect(() => clearTimers, [clearTimers])

  function handleContinue() {
    setWarning(false)
  }

  function handleSignOutNow() {
    clearTimers()
    signOut()
  }

  if (!warning) return null

  return (
    <ConfirmDialog
      tone="warning"
      title="Tu sesión está por cerrar"
      description={`Por inactividad, cerraremos tu sesión en ${secondsLeft} segundo${secondsLeft === 1 ? '' : 's'}. ¿Deseas continuar?`}
      confirmLabel="Cerrar sesión"
      cancelLabel="Continuar sesión"
      onConfirm={handleSignOutNow}
      onClose={handleContinue}
    />
  )
}
