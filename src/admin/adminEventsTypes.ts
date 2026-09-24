export type EventKind = 'gratis' | 'pago' | 'hibrido'

export type DiscountKind = 'percent' | 'fixed' | 'free'

export interface DiscountCode {
  id: string
  code: string
  kind: DiscountKind
  /** Percent (0–100) when kind === 'percent', COP amount when kind === 'fixed', ignored when 'free'. */
  value: number
  maxUses: number
  usedCount: number
}

// TODO(Supabase): this shape maps almost directly onto an `events` table —
// see the session summary for the proposed column list (id, title,
// description, event_date, event_time, place, image_url, kind, price,
// capacity, published, created_at) plus a child `discount_codes` table
// keyed by event_id. `reservedCount` is NOT a column: in production it's a
// COUNT(*) over the `reservations` table for that event, computed with a
// query/view rather than stored redundantly on the event row.
export interface AdminEvent {
  id: string
  title: string
  description: string
  /** ISO date 'YYYY-MM-DD', or null while the date is still "por confirmar". */
  date: string | null
  /** 24h 'HH:mm', or null alongside a null date. */
  time: string | null
  place: string
  /** Local object URL in the mock; a Supabase Storage public URL in production. */
  imageUrl: string | null
  kind: EventKind
  /** COP; null/0 when kind === 'gratis'. */
  price: number | null
  capacity: number
  reservedCount: number
  published: boolean
  discountCodes: DiscountCode[]
  createdAt: number
}

export type EventStatus = 'activo' | 'sin_cupos' | 'proximamente' | 'finalizado' | 'inactivo'

export const STATUS_META: Record<EventStatus, { label: string; className: string }> = {
  activo: { label: 'Activo', className: 'status-pill--activo' },
  sin_cupos: { label: 'Sin cupos', className: 'status-pill--sin-cupos' },
  proximamente: { label: 'Próximamente', className: 'status-pill--proximamente' },
  finalizado: { label: 'Finalizado', className: 'status-pill--finalizado' },
  inactivo: { label: 'Inactivo', className: 'status-pill--inactivo' },
}

/**
 * Precedence, most to least specific: an unpublished event is always
 * "inactivo" regardless of its date; a full event is "sin_cupos" even if
 * upcoming; a missing date reads as "proximamente" (date still TBD); a past
 * date is "finalizado"; anything else published with a set future date and
 * open capacity is "activo".
 */
export function getEventStatus(event: Pick<AdminEvent, 'published' | 'capacity' | 'reservedCount' | 'date'>): EventStatus {
  if (!event.published) return 'inactivo'
  if (event.reservedCount >= event.capacity) return 'sin_cupos'
  if (!event.date) return 'proximamente'

  const eventDateTime = new Date(event.date)
  eventDateTime.setHours(23, 59, 59, 999)
  if (eventDateTime.getTime() < Date.now()) return 'finalizado'

  return 'activo'
}

export function formatEventSchedule(date: string | null, time: string | null): string {
  if (!date) return 'Por confirmar fecha'

  const parsed = new Date(`${date}T00:00:00`)
  const datePart = new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }).format(parsed)
  const capitalized = datePart.charAt(0).toUpperCase() + datePart.slice(1)

  if (!time) return capitalized

  const [hoursStr, minutesStr] = time.split(':')
  const hours24 = Number(hoursStr)
  const minutes = Number(minutesStr)
  const period = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  const timePart = `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`

  return `${capitalized} — ${timePart}`
}

export function formatPrice(kind: EventKind, price: number | null): string {
  if (kind === 'gratis' || !price) return 'Gratis'
  return `$${price.toLocaleString('es-CO')} COP`
}
