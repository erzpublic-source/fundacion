import { useState } from 'react'
import './TicketApprovedModal.css'

function CheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 12.5l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M3 10.5V3.5A1.5 1.5 0 0 1 4.5 2h7" strokeLinecap="round" />
    </svg>
  )
}

// A stand-in for a real scannable QR (there's no ticket-scanning backend yet
// to encode) — just the finder-pattern corners, enough to read as "this is a
// code you could scan" without claiming to be a working one.
function MockQrIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <rect x="10" y="10" width="14" height="14" rx="2" />
      <rect x="40" y="10" width="14" height="14" rx="2" />
      <rect x="10" y="40" width="14" height="14" rx="2" />
    </svg>
  )
}

interface TicketApprovedModalProps {
  attendeeName: string
  ticketCode: string
  onClose: () => void
}

// TODO(Supabase): ticketCode currently comes from the mock
// AdminReservationsContext (approveReservation) — once Storage/Auth is
// wired up this modal instead reads back the row just inserted into
// `tickets`, and "Copiar código" stays the same client-side clipboard call.
export default function TicketApprovedModal({ attendeeName, ticketCode, onClose }: TicketApprovedModalProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(ticketCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can be denied by the browser — the code is already
      // visible on screen, so there's nothing further to recover here.
    }
  }

  return (
    <div className="ticket-approved-backdrop" role="presentation">
      <div className="ticket-approved" role="dialog" aria-modal="true" aria-labelledby="ticket-approved-title">
        <span className="ticket-approved__icon" aria-hidden="true">
          <CheckIcon />
        </span>

        <h3 id="ticket-approved-title">¡Reserva aprobada!</h3>
        <p>Se ha generado el código de entrada para {attendeeName}</p>

        <div className="ticket-approved__code-box">
          <span className="ticket-approved__code-label">Código de entrada</span>
          <strong className="ticket-approved__code">{ticketCode}</strong>
          <span className="ticket-approved__qr">
            <MockQrIcon />
          </span>
        </div>

        <button type="button" className="btn btn--secondary ticket-approved__copy" onClick={handleCopy}>
          <CopyIcon />
          {copied ? '¡Copiado!' : 'Copiar código'}
        </button>

        <p className="ticket-approved__hint">
          Puedes pegar este código en el correo de confirmación que enviarás al asistente.
        </p>

        <button type="button" className="btn btn--primary ticket-approved__close" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
