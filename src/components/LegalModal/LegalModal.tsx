import { useEffect } from 'react'
import type { ReactNode } from 'react'
import './LegalModal.css'

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2 2l12 12M14 2 2 14" strokeLinecap="round" />
    </svg>
  )
}

interface LegalModalProps {
  open: boolean
  onClose: () => void
  onAccept: () => void
  title: string
  updatedLabel?: string
  note: string
  children: ReactNode
}

export default function LegalModal({ open, onClose, onAccept, title, updatedLabel, note, children }: LegalModalProps) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="legal-modal-backdrop" onClick={onClose}>
      <div
        className="legal-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="legal-modal__header">
          <div>
            <h3>{title}</h3>
            {updatedLabel && <p className="legal-modal__updated">{updatedLabel}</p>}
          </div>
          <button type="button" className="legal-modal__close" onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <div className="legal-modal__body">{children}</div>

        <div className="legal-modal__footer">
          <p>{note}</p>
          <div className="legal-modal__actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Rechazar
            </button>
            <button type="button" className="btn btn--primary" onClick={onAccept}>
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
