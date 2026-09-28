export type ReservationStatus = 'pendiente' | 'aprobado' | 'rechazado'

// TODO(Supabase): mirrors the future `reservations` table (id, event_id,
// attendee_name, email, amount_paid, receipt_url, status, created_at).
// `ticketCode` stays null until approved; in production the code isn't a
// column here — approving inserts a row into a separate `tickets` table
// keyed by reservation_id, and this field becomes a join/lookup instead.
export interface Reservation {
  id: string
  eventId: string
  attendeeName: string
  email: string
  amountPaid: number
  status: ReservationStatus
  ticketCode: string | null
  createdAt: number
}

export const RESERVATION_STATUS_META: Record<ReservationStatus, { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'reserva-status--pendiente' },
  aprobado: { label: 'Aprobado', className: 'reserva-status--aprobado' },
  rechazado: { label: 'Rechazado', className: 'reserva-status--rechazado' },
}

export function formatReservationAmount(amount: number): string {
  if (!amount) return 'Gratis'
  return `$${amount.toLocaleString('es-CO')} COP`
}
