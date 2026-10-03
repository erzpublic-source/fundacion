import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
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

function DocumentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M7 3h7l5 5v13H7V3Z" strokeLinejoin="round" />
      <path d="M14 3v5h5" strokeLinejoin="round" />
    </svg>
  )
}

function formatReceiptDate(timestamp: number): string {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp))
}

const SIGNED_URL_TTL_SECONDS = 300

interface ReceiptModalProps {
  reservation: Reservation
  onClose: () => void
  onRequestApprove: (reservation: Reservation) => void
  onRequestReject: (reservation: Reservation) => void
}

export default function ReceiptModal({ reservation, onClose, onRequestApprove, onRequestReject }: ReceiptModalProps) {
  const statusMeta = RESERVATION_STATUS_META[reservation.status]

  const [loadingReceipt, setLoadingReceipt] = useState(Boolean(reservation.receiptUrl))
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!reservation.receiptUrl) {
      setLoadingReceipt(false)
      return
    }

    let cancelled = false
    setLoadingReceipt(true)
    setLoadError(false)

    supabase.storage
      .from('payment-receipts')
      .createSignedUrl(reservation.receiptUrl, SIGNED_URL_TTL_SECONDS)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          setLoadError(true)
        } else {
          setSignedUrl(data.signedUrl)
        }
        setLoadingReceipt(false)
      })

    return () => {
      cancelled = true
    }
  }, [reservation.receiptUrl])

  const isPdf = reservation.receiptUrl?.toLowerCase().endsWith('.pdf') ?? false

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

        <dl className="receipt-modal__summary">
          <dt>Monto</dt>
          <dd>{formatReservationAmount(reservation.amountPaid)}</dd>
          <dt>Fecha de la reserva</dt>
          <dd>{formatReceiptDate(reservation.createdAt)}</dd>
        </dl>

        <div className="receipt-modal__viewer">
          <span className="receipt-modal__viewer-tag">Comprobante adjunto</span>

          {!reservation.receiptUrl && (
            <p className="receipt-modal__empty">Esta reserva no tiene comprobante adjunto (evento gratuito).</p>
          )}

          {reservation.receiptUrl && loadingReceipt && <p className="receipt-modal__empty">Cargando comprobante...</p>}

          {reservation.receiptUrl && !loadingReceipt && loadError && (
            <p className="receipt-modal__empty">No pudimos cargar el comprobante. Intenta de nuevo.</p>
          )}

          {signedUrl && !loadingReceipt && !loadError && isPdf && (
            <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="receipt-modal__pdf-link">
              <DocumentIcon />
              Abrir comprobante (PDF)
            </a>
          )}

          {signedUrl && !loadingReceipt && !loadError && !isPdf && (
            <img src={signedUrl} alt="Comprobante de pago" className="receipt-modal__image" />
          )}
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
