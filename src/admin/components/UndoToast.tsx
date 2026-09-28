import { useEffect } from 'react'
import './UndoToast.css'

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3 22 20H2L12 3Z" strokeLinejoin="round" />
      <path d="M12 9.5v4.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
    </svg>
  )
}

interface UndoToastProps {
  message: string
  durationMs: number
  onUndo: () => void
  onDismiss: () => void
}

// Shared by every "optimistic action with a grace window" moment in the
// admin panel (rechazar una reserva, eliminar un evento) — the action is
// already applied in the shared store the instant this toast appears; it
// only owns the *window* to undo it. Letting the timer expire, or
// unmounting before it does, both just let that window close; either way
// the caller is responsible for sealing the change for good (see each
// screen's onDismiss handler).
export default function UndoToast({ message, durationMs, onUndo, onDismiss }: UndoToastProps) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, durationMs)
    return () => window.clearTimeout(id)
  }, [durationMs, onDismiss])

  return (
    <div className="undo-toast" role="status">
      <div className="undo-toast__row">
        <span className="undo-toast__icon" aria-hidden="true">
          <WarningIcon />
        </span>
        <p className="undo-toast__message">{message}</p>
        <button type="button" className="undo-toast__undo" onClick={onUndo}>
          Deshacer
        </button>
        <button type="button" className="undo-toast__close" onClick={onDismiss} aria-label="Cerrar">
          <CloseIcon />
        </button>
      </div>
      <span className="undo-toast__bar" style={{ animationDuration: `${durationMs}ms` }} />
    </div>
  )
}
