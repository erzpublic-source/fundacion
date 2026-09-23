import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import './ReservationDrawer.css'

const MAX_TICKETS = 4
const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024
const ACCEPTED_RECEIPT_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

// Mock codes for now — there is no backend validating these yet.
const DISCOUNT_CODES: Record<string, { type: 'percent' | 'amount'; value: number; message: string }> = {
  UNDIAMAS: { type: 'percent', value: 100, message: '¡Código aplicado! 100% de descuento.' },
  APOYO10: { type: 'amount', value: 10000, message: 'Descuento de $10.000 aplicado.' },
}

const PAYMENT_ACCOUNTS = {
  nequi: { label: 'Nequi', account: '300 000 0000', holder: 'Fundación Un Día Más' },
  breb: { label: 'Bre-B', account: '@undiamas.fundacion', holder: 'Fundación Un Día Más' },
} as const

type PaymentMethod = keyof typeof PAYMENT_ACCOUNTS

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2 2l12 12M14 2 2 14" strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="2" />
      <path d="M2 6.5h12M5 1.5v2M11 1.5v2" strokeLinecap="round" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M8 14.5s5-4.4 5-8.3A5 5 0 0 0 3 6.2c0 3.9 5 8.3 5 8.3Z" strokeLinejoin="round" />
      <circle cx="8" cy="6.2" r="1.8" />
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="5.5" cy="5.5" r="2" />
      <circle cx="11" cy="6" r="1.6" />
      <path d="M1.5 13.5c.5-2.5 2.2-4 4-4s3.5 1.5 4 4M9.8 9.7c1.4.1 2.7 1.4 3.1 3.3" strokeLinecap="round" />
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path
        d="M1.5 6a1.5 1.5 0 0 0 0 3v2A1.5 1.5 0 0 0 3 12.5h10A1.5 1.5 0 0 0 14.5 11V9a1.5 1.5 0 0 0 0-3V4.5A1.5 1.5 0 0 0 13 3H3a1.5 1.5 0 0 0-1.5 1.5V6Z"
        strokeLinejoin="round"
      />
      <path d="M6 3v9.5" strokeDasharray="1.6 1.6" strokeLinecap="round" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#25b46a" strokeWidth="1.7" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.5l2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M10 13V3M6 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 13v2.5A1.5 1.5 0 0 0 4.5 17h11a1.5 1.5 0 0 0 1.5-1.5V13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 1.5h5.5L12.5 4.5V14.5H4Z" strokeLinejoin="round" />
      <path d="M9.5 1.5v3h3M6 8.5h4M6 11h4" strokeLinecap="round" />
    </svg>
  )
}

function RemoveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M2 2l8 8M10 2l-8 8" strokeLinecap="round" />
    </svg>
  )
}

export interface ReservationDrawerEvent {
  images: string[]
  title: string
  statusLabel: string
  statusTone: 'success' | 'warning'
  dateTime: string
  place: string
  capacityNote: string
  price: number
  description: string
}

interface ReservationDrawerProps {
  event: ReservationDrawerEvent
  onClose: () => void
}

export default function ReservationDrawer({ event, onClose }: ReservationDrawerProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [descExpanded, setDescExpanded] = useState(false)

  const [quantity, setQuantity] = useState(1)
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [attendeeNames, setAttendeeNames] = useState<string[]>([])

  const [discountInput, setDiscountInput] = useState('')
  const [discountApplied, setDiscountApplied] = useState<{ type: 'percent' | 'amount'; value: number; message: string } | null>(
    null,
  )
  const [discountError, setDiscountError] = useState<string | null>(null)

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('nequi')
  const [copied, setCopied] = useState(false)
  const [receipt, setReceipt] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [receiptError, setReceiptError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [submitting, setSubmitting] = useState(false)
  const [reservationCode, setReservationCode] = useState('')
  const [step, setStep] = useState<'form' | 'success'>('form')

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  useEffect(() => {
    return () => {
      if (receiptPreview) URL.revokeObjectURL(receiptPreview)
    }
  }, [receiptPreview])

  const subtotal = quantity * event.price

  const discountAmount = useMemo(() => {
    if (!discountApplied) return 0
    if (discountApplied.type === 'percent') return Math.round(subtotal * (discountApplied.value / 100))
    return Math.min(discountApplied.value, subtotal)
  }, [discountApplied, subtotal])

  const total = Math.max(0, subtotal - discountAmount)
  const isFree = total === 0

  function updateQuantity(next: number) {
    const clamped = Math.min(MAX_TICKETS, Math.max(1, next))
    setQuantity(clamped)
    setAttendeeNames((prev) => {
      const needed = clamped - 1
      const copy = prev.slice(0, needed)
      while (copy.length < needed) copy.push('')
      return copy
    })
  }

  function updateAttendeeName(index: number, value: string) {
    setAttendeeNames((prev) => {
      const copy = [...prev]
      copy[index] = value
      return copy
    })
  }

  function applyDiscount() {
    const code = discountInput.trim().toUpperCase()
    if (!code) return
    const found = DISCOUNT_CODES[code]
    if (found) {
      setDiscountApplied(found)
      setDiscountError(null)
    } else {
      setDiscountApplied(null)
      setDiscountError('Código inválido o expirado.')
    }
  }

  function handleReceiptChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (!file) return

    if (!ACCEPTED_RECEIPT_TYPES.includes(file.type)) {
      setReceiptError('Solo se aceptan archivos JPG, PNG o PDF.')
      setReceipt(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    if (file.size > MAX_RECEIPT_SIZE_BYTES) {
      setReceiptError('El archivo supera el máximo permitido de 5 MB.')
      setReceipt(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setReceiptError(null)
    setReceipt(file)
    if (receiptPreview) URL.revokeObjectURL(receiptPreview)
    setReceiptPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null)
  }

  function removeReceipt() {
    setReceipt(null)
    setReceiptError(null)
    if (receiptPreview) URL.revokeObjectURL(receiptPreview)
    setReceiptPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function copyAccount() {
    try {
      await navigator.clipboard.writeText(PAYMENT_ACCOUNTS[paymentMethod].account)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard permission denied or unavailable — nothing to recover here,
      // the account number is still visible on screen to copy by hand.
    }
  }

  const buyerValid = buyerName.trim() !== '' && buyerEmail.trim() !== '' && buyerPhone.trim() !== ''
  const attendeesValid = attendeeNames.every((name) => name.trim() !== '')
  const receiptValid = isFree || receipt !== null
  const canSubmit = buyerValid && attendeesValid && receiptValid && !submitting

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setSubmitting(true)
    // TODO(Supabase): replace this local simulation with the real insert +
    // receipt upload once the project is connected. For now this only
    // updates local UI state, nothing is persisted or sent anywhere.
    await new Promise((resolve) => window.setTimeout(resolve, 900))
    setReservationCode(`#RES-${Math.floor(1000 + Math.random() * 9000)}`)
    setSubmitting(false)
    setStep('success')
  }

  return (
    <div className="reservation-drawer-backdrop" onClick={onClose}>
      <aside
        className="reservation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="reservation-drawer__close" onClick={onClose} aria-label="Cerrar">
          <CloseIcon />
        </button>

        {step === 'form' && (
          <form className="reservation-drawer__scroll" onSubmit={handleSubmit}>
            {/* ---------- Bloque 1: resumen y ficha del evento ---------- */}
            <div className="reservation-drawer__carousel">
              <div
                className="reservation-drawer__carousel-image"
                role="img"
                aria-label={event.title}
                style={{ backgroundImage: `url(${event.images[activeImage]})` }}
              />
              {event.images.length > 1 && (
                <div className="reservation-drawer__dots">
                  {event.images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`reservation-drawer__dot${i === activeImage ? ' reservation-drawer__dot--active' : ''}`}
                      aria-label={`Foto ${i + 1}`}
                      onClick={() => setActiveImage(i)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="reservation-drawer__section">
              <span className={`reservation-drawer__status reservation-drawer__status--${event.statusTone}`}>
                {event.statusLabel}
              </span>
              <h2 className="reservation-drawer__title">{event.title}</h2>

              <div className="reservation-drawer__facts">
                <p>
                  <CalendarIcon />
                  {event.dateTime}
                </p>
                <p>
                  <LocationIcon />
                  {event.place}
                </p>
                <p>
                  <PeopleIcon />
                  {event.capacityNote}
                </p>
                <p>
                  <TicketIcon />
                  {event.price === 0 ? 'Entrada libre' : `Valor: ${formatCOP(event.price)} COP por entrada`}
                </p>
              </div>

              <p className={`reservation-drawer__description${descExpanded ? '' : ' reservation-drawer__description--clamped'}`}>
                {event.description}{' '}
                <button type="button" className="reservation-drawer__link" onClick={() => setDescExpanded((v) => !v)}>
                  {descExpanded ? 'Leer menos' : 'Leer más'}
                </button>
              </p>
            </div>

            {/* ---------- Bloque 2: formulario de reserva y asistentes ---------- */}
            <div className="reservation-drawer__section">
              <h3 className="reservation-drawer__section-title">Información de Reserva</h3>

              <div className="reservation-drawer__field reservation-drawer__field--row">
                <label>Cantidad de entradas (Máx. {MAX_TICKETS})</label>
                <div className="reservation-drawer__stepper">
                  <button type="button" onClick={() => updateQuantity(quantity - 1)} disabled={quantity <= 1} aria-label="Quitar entrada">
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(quantity + 1)}
                    disabled={quantity >= MAX_TICKETS}
                    aria-label="Agregar entrada"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="reservation-drawer__field">
                <label htmlFor="buyer-name">Nombre completo</label>
                <input id="buyer-name" type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required />
              </div>

              <div className="reservation-drawer__field">
                <label htmlFor="buyer-email">Correo electrónico</label>
                <input
                  id="buyer-email"
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  required
                />
              </div>

              <div className="reservation-drawer__field">
                <label htmlFor="buyer-phone">Teléfono / WhatsApp</label>
                <input id="buyer-phone" type="tel" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} required />
              </div>

              {attendeeNames.map((name, i) => (
                <div className="reservation-drawer__field" key={i}>
                  <label htmlFor={`attendee-${i}`}>Nombre completo del asistente {i + 2}</label>
                  <input
                    id={`attendee-${i}`}
                    type="text"
                    value={name}
                    onChange={(e) => updateAttendeeName(i, e.target.value)}
                    required
                  />
                </div>
              ))}

              <div className="reservation-drawer__field">
                <label htmlFor="discount-code">Código de invitación / descuento</label>
                <div className="reservation-drawer__discount">
                  <input
                    id="discount-code"
                    type="text"
                    placeholder="Opcional"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                  />
                  <button type="button" className="btn btn--secondary" onClick={applyDiscount}>
                    Aplicar
                  </button>
                </div>
                {discountApplied && <p className="reservation-drawer__discount-ok">{discountApplied.message}</p>}
                {discountError && <p className="reservation-drawer__discount-error">{discountError}</p>}
              </div>
            </div>

            {/* ---------- Bloque 3: pasarela manual ---------- */}
            {!isFree && (
              <div className="reservation-drawer__section">
                <h3 className="reservation-drawer__section-title">Confirmar pago</h3>

                <div className="reservation-drawer__price-breakdown">
                  <div>
                    <span>Subtotal</span>
                    <span>{formatCOP(subtotal)}</span>
                  </div>
                  {discountApplied && (
                    <div className="reservation-drawer__price-breakdown-discount">
                      <span>Descuento</span>
                      <span>−{formatCOP(discountAmount)}</span>
                    </div>
                  )}
                  <div className="reservation-drawer__price-breakdown-total">
                    <span>Total a pagar</span>
                    <span>{formatCOP(total)}</span>
                  </div>
                </div>

                <div className="reservation-drawer__payment-tabs">
                  {(Object.keys(PAYMENT_ACCOUNTS) as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      className={`reservation-drawer__payment-tab${method === paymentMethod ? ' reservation-drawer__payment-tab--active' : ''}`}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {PAYMENT_ACCOUNTS[method].label}
                    </button>
                  ))}
                </div>

                <div className="reservation-drawer__account">
                  <div>
                    <span className="reservation-drawer__account-label">
                      {paymentMethod === 'nequi' ? 'Número de cuenta' : 'Llave Bre-B'}
                    </span>
                    <span className="reservation-drawer__account-value">{PAYMENT_ACCOUNTS[paymentMethod].account}</span>
                    <span className="reservation-drawer__account-holder">{PAYMENT_ACCOUNTS[paymentMethod].holder}</span>
                  </div>
                  <button type="button" className="reservation-drawer__copy" onClick={copyAccount}>
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                <div className="reservation-drawer__field">
                  <label>Comprobante de pago (JPG, PNG o PDF, máx. 5 MB)</label>

                  {receipt ? (
                    <div className="reservation-drawer__receipt">
                      {receiptPreview ? (
                        <img src={receiptPreview} alt="Vista previa del comprobante" />
                      ) : (
                        <span className="reservation-drawer__receipt-file">
                          <DocumentIcon />
                        </span>
                      )}
                      <span className="reservation-drawer__receipt-name">{receipt.name}</span>
                      <button type="button" className="reservation-drawer__receipt-remove" onClick={removeReceipt} aria-label="Quitar comprobante">
                        <RemoveIcon />
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="reservation-drawer__upload" onClick={() => fileInputRef.current?.click()}>
                      <UploadIcon />
                      Adjuntar comprobante
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleReceiptChange}
                    className="reservation-drawer__file-input"
                  />
                  {receiptError && <p className="reservation-drawer__discount-error">{receiptError}</p>}
                </div>

                <p className="reservation-drawer__note">
                  Una vez envíes tu solicitud, validaremos tu comprobante y recibirás la confirmación con tu código de
                  reserva.
                </p>
              </div>
            )}

            <div className="reservation-drawer__footer">
              <p className="reservation-drawer__footer-summary">
                Total: {formatCOP(total)} ({quantity} {quantity === 1 ? 'entrada' : 'entradas'})
              </p>
              <button type="submit" className="btn btn--primary reservation-drawer__submit" disabled={!canSubmit}>
                {submitting ? 'Enviando...' : isFree ? 'Confirmar reserva gratuita' : 'Enviar comprobante y reservar'}
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="reservation-drawer__scroll reservation-drawer__success">
            <CheckCircleIcon />
            <h2>¡Reserva recibida con éxito!</h2>
            <span className="reservation-drawer__success-code">Código de trámite: {reservationCode}</span>

            <p className="reservation-drawer__success-note">
              Estamos validando tu {isFree ? 'reserva' : 'pago'} con el equipo de la fundación. Te notificaremos vía
              correo electrónico con tu código de entrada oficial tan pronto sea aprobado.
            </p>

            <dl className="reservation-drawer__success-summary">
              <div>
                <dt>Evento</dt>
                <dd>{event.title}</dd>
              </div>
              <div>
                <dt>Cantidad</dt>
                <dd>
                  {quantity} {quantity === 1 ? 'entrada' : 'entradas'}
                </dd>
              </div>
              <div>
                <dt>Total reportado</dt>
                <dd>{formatCOP(total)}</dd>
              </div>
            </dl>

            <button type="button" className="btn btn--primary reservation-drawer__submit" onClick={onClose}>
              Cerrar
            </button>
            <p className="reservation-drawer__success-help">
              ¿Problemas con el reporte? Escríbenos a info@fundacionundiamas.org
            </p>
          </div>
        )}
      </aside>
    </div>
  )
}
