import type { Reservation } from '../reservationsTypes'
import { RESERVATION_STATUS_META, formatReservationAmount } from '../reservationsTypes'
import './ReceiptModal.css'

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
    </svg>
  )
}

function CheckBadgeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 12.5l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function formatReceiptDate(timestamp: number): string {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp))
}

interface ReceiptModalProps {
  reservation: Reservation
  onClose: () => void
  onRequestApprove: (reservation: Reservation) => void
  onRequestReject: (reservation: Reservation) => void
}

// TODO(Supabase): the "mock receipt" below stands in for the real uploaded
// file — once Storage is wired up this reads reservation.receiptUrl (an
// image/PDF) instead of rendering a synthesized summary.
export default function ReceiptModal({ reservation, onClose, onRequestApprove, onRequestReject }: ReceiptModalProps) {
  const statusMeta = RESERVATION_STATUS_META[reservation.status]
  const transactionId = `TRN-${reservation.id.slice(-8).toUpperCase()}`

  return (
    <div className="receipt-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="receipt-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="receipt-modal__header">
          <h3 id="receipt-modal-title">Comprobante de pago</h3>
          <button type="button" className="receipt-modal__close" onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <div className="receipt-modal__attendee">
          <div>
            <strong>{reservation.attendeeName}</strong>
            <span>{reservation.email}</span>
          </div>
          <span className={`status-pill ${statusMeta.className}`}>{statusMeta.label}</span>
        </div>

        <div className="receipt-modal__viewer">
          <span className="receipt-modal__viewer-tag">Comprobante adjunto</span>

          <div className="receipt-modal__mock-receipt">
            <span className="receipt-modal__mock-badge">
              <CheckBadgeIcon />
            </span>
            <p className="receipt-modal__mock-status">Transferencia exitosa</p>

            <div className="receipt-modal__mock-amount">
              <span>Monto enviado</span>
              <strong>{formatReservationAmount(reservation.amountPaid)}</strong>
            </div>

            <dl className="receipt-modal__mock-fields">
              <dt>Destinatario</dt>
              <dd>Fundación Un Día Más</dd>
              <dt>Fecha y hora</dt>
              <dd>{formatReceiptDate(reservation.createdAt)}</dd>
              <dt>ID de transacción</dt>
              <dd>{transactionId}</dd>
              <dt>Método de pago</dt>
              <dd>Transferencia bancaria</dd>
            </dl>
          </div>
        </div>

        <div className="receipt-modal__actions">
          {reservation.status === 'pendiente' ? (
            <>
              <div className="receipt-modal__actions-left">
                <button
                  type="button"
                  className="btn receipt-modal__btn receipt-modal__btn--reject"
                  onClick={() => onRequestReject(reservation)}
                >
                  Rechazar
                </button>
                <button type="button" className="admin-link receipt-modal__btn-close" onClick={onClose}>
                  Cerrar
                </button>
              </div>
              <button
                type="button"
                className="btn receipt-modal__btn receipt-modal__btn--approve"
                onClick={() => onRequestApprove(reservation)}
              >
                Aprobar Pago
              </button>
            </>
          ) : (
            <button type="button" className="btn btn--secondary receipt-modal__btn" onClick={onClose}>
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
