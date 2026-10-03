export type ReservationStatus = 'pendiente' | 'aprobado' | 'rechazado'

// Mirrors the `reservations` table (id, event_id, attendee_name, email,
// amount_paid, receipt_url, status, created_at).
// TODO(Supabase): `ticketCode` stays null until approved; a future iteration
// could move it into a separate `tickets` table keyed by reservation_id
// instead of a column here, so this field becomes a join/lookup instead.
export interface Reservation {
  id: string
  eventId: string
  attendeeName: string
  email: string
  amountPaid: number
  status: ReservationStatus
  /**
   * Storage path (not a public URL — the `payment-receipts` bucket is
   * private) within that bucket, or null for a free reservation that never
   * required a receipt. Resolve it to a viewable link with
   * `supabase.storage.from('payment-receipts').createSignedUrl(...)`.
   */
  receiptUrl: string | null
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
