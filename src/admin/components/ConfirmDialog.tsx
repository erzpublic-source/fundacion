import './ConfirmDialog.css'

function CheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 12.5l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
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

interface ConfirmDialogProps {
  tone: 'confirm' | 'danger'
  title: string
  description: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

// Shared by every "are you sure?" moment in the admin panel (approve/reject
// a reservation, delete an event) so the interaction stays identical: same
// icon language, same button layout, same escape hatch.
export default function ConfirmDialog({
  tone,
  title,
  description,
  confirmLabel = 'Confirmar',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <div className="confirm-dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="confirm-dialog__close" onClick={onClose} aria-label="Cerrar">
          <CloseIcon />
        </button>

        <span className={`confirm-dialog__icon confirm-dialog__icon--${tone}`}>
          {tone === 'confirm' ? <CheckIcon /> : <WarningIcon />}
        </span>

        <h3 id="confirm-dialog-title">{title}</h3>
        <p>{description}</p>

        <button type="button" className="btn btn--primary confirm-dialog__confirm" onClick={onConfirm} disabled={loading}>
          {loading ? 'Procesando...' : confirmLabel}
        </button>
        <button type="button" className="btn btn--secondary confirm-dialog__cancel" onClick={onClose} disabled={loading}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
