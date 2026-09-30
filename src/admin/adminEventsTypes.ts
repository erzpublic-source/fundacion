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
// capacity, published, featured, created_at) plus a child `discount_codes`
// table keyed by event_id. `reservedCount` is NOT a column: in production
// it's a COUNT(*) over the `reservations` table for that event, computed
// with a query/view rather than stored redundantly on the event row.
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
  /**
   * Highlights this event as the featured/hero event on the public home page.
   * TODO(Supabase): enforce "at most one featured event" with a partial
   * unique index (e.g. `UNIQUE (featured) WHERE featured`) instead of the
   * mock's app-level "unset every other row" logic in setFeatured().
   */
  featured: boolean
  /**
   * Marks the event as a pre-launch announcement: it has no ticket
   * configuration yet (capacity/price/discount codes), regardless of
   * whether a date has been confirmed — the date and the ticket setup are
   * independent decisions. Drives the "proximamente" status together with
   * a missing date. Distinct from `salesPaused`, which pauses sales on an
   * event that's already fully configured and launched.
   * TODO(Supabase): an `is_announcement` boolean column on `events`.
   */
  isAnnouncement: boolean
  /**
   * Temporarily stops new ticket sales on an already-configured, launched
   * event (e.g. it sold out its current batch, or the organizer needs to
   * pause while sorting out logistics) without unpublishing it (it stays
   * visible on the public site, just not purchasable) and without reverting
   * it to "proximamente" — it keeps its computed status and simply shows a
   * secondary "ventas pausadas" badge. Distinct from `published`, which
   * controls visibility altogether, and from `isAnnouncement`, which is the
   * pre-launch stage before any ticket configuration exists.
   * TODO(Supabase): a `sales_paused` boolean column on `events`; the public
   * reservation flow must check it alongside capacity before allowing a
   * new reservation.
   */
  salesPaused: boolean
  /**
   * Only meaningful when kind === 'gratis': a free, open event (e.g. a
   * community walk-in activity) that doesn't track capacity or ask
   * attendees to register/reserve a spot beforehand — false is the only
   * value that makes sense for 'pago'/'hibrido', which always need a
   * registration step to charge or allocate a slot. When false, `capacity`
   * is ignored (never compared against `reservedCount`) and the public
   * reservation flow shows an "evento abierto" note instead of a booking
   * form.
   * TODO(Supabase): a `requires_registration` boolean column on `events`,
   * default true.
   */
  requiresRegistration: boolean
  discountCodes: DiscountCode[]
  createdAt: number
}

export type EventStatus = 'publicado' | 'borrador' | 'cupos_agotados' | 'proximamente' | 'finalizado'

export const STATUS_META: Record<EventStatus, { label: string; className: string }> = {
  publicado: { label: 'Publicado', className: 'status-pill--publicado' },
  borrador: { label: 'Borrador', className: 'status-pill--borrador' },
  cupos_agotados: { label: 'Cupos agotados', className: 'status-pill--cupos-agotados' },
  proximamente: { label: 'Próximamente', className: 'status-pill--proximamente' },
  finalizado: { label: 'Finalizado', className: 'status-pill--finalizado' },
}

// Same visual order used for the filter segmented control and (implicitly)
// for status precedence below.
export const STATUS_ORDER: EventStatus[] = ['publicado', 'borrador', 'cupos_agotados', 'proximamente', 'finalizado']

/**
 * Precedence, most to least specific: an unpublished event is always
 * "borrador" regardless of its date; an announcement (no ticket
 * configuration yet) reads as "proximamente" even when a date is already
 * set — the date can be confirmed before ticket configuration is — same as
 * a missing date, which reads "proximamente" for the same reason even if
 * the event isn't explicitly marked as an announcement; a full event is
 * "cupos_agotados" (skipped entirely for a `requiresRegistration: false`
 * open event, since it never tracks capacity); a past date is "finalizado";
 * anything else published, configured, with a set future date and open
 * capacity is "publicado".
 * Note `salesPaused` never appears here: pausing sales on an
 * already-configured, launched event doesn't change its computed status —
 * it's surfaced as a secondary badge instead (see EventCard).
 */
export function getEventStatus(
  event: Pick<AdminEvent, 'published' | 'capacity' | 'reservedCount' | 'date' | 'isAnnouncement' | 'requiresRegistration'>,
): EventStatus {
  if (!event.published) return 'borrador'
  if (event.isAnnouncement || !event.date) return 'proximamente'
  if (event.requiresRegistration && event.reservedCount >= event.capacity) return 'cupos_agotados'

  const eventDateTime = new Date(event.date)
  eventDateTime.setHours(23, 59, 59, 999)
  if (eventDateTime.getTime() < Date.now()) return 'finalizado'

  return 'publicado'
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
