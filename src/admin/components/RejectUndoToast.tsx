import { useEffect } from 'react'
import './RejectUndoToast.css'

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

interface RejectUndoToastProps {
  attendeeName: string
  durationMs: number
  onUndo: () => void
  onDismiss: () => void
}

// The rejection is already applied in the shared reservations store the
// moment this toast appears (see EventoReservas.handleConfirmReject) — this
// component only owns the *window* to undo it. Letting the timer expire, or
// unmounting before it does, both just let that window close; either way the
// rejection stays sealed without any further action needed here.
export default function RejectUndoToast({ attendeeName, durationMs, onUndo, onDismiss }: RejectUndoToastProps) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, durationMs)
    return () => window.clearTimeout(id)
  }, [durationMs, onDismiss])

  return (
    <div className="reject-toast" role="status">
      <div className="reject-toast__row">
        <span className="reject-toast__icon" aria-hidden="true">
          <WarningIcon />
        </span>
        <p className="reject-toast__message">Reserva de {attendeeName} rechazada</p>
        <button type="button" className="reject-toast__undo" onClick={onUndo}>
          Deshacer
        </button>
        <button type="button" className="reject-toast__close" onClick={onDismiss} aria-label="Cerrar">
          <CloseIcon />
        </button>
      </div>
      <span className="reject-toast__bar" style={{ animationDuration: `${durationMs}ms` }} />
    </div>
  )
}
