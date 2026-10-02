import { useMemo, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import ReservationDrawer from '../../components/ReservationDrawer/ReservationDrawer'
import type { ReservationDrawerEvent } from '../../components/ReservationDrawer/ReservationDrawer'
import { useAdminEvents } from '../../admin/AdminEventsContext'
import type { AdminEvent, EventStatus } from '../../admin/adminEventsTypes'
import { getEventStatus } from '../../admin/adminEventsTypes'
import eventosAvatar1 from '../../assets/images/eventos-avatar-1.jpg'
import eventosAvatar2 from '../../assets/images/eventos-avatar-2.jpg'
import './Eventos.css'

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

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type Availability = 'disponible' | 'ultimas' | 'agotado'

const AVAILABILITY_META: Record<Availability, { label: string; className: string; ctaDisabled: boolean }> = {
  disponible: { label: 'Entradas disponibles', className: 'evento-actual__tag--disponible', ctaDisabled: false },
  ultimas: { label: 'Últimas entradas', className: 'evento-actual__tag--ultimas', ctaDisabled: false },
  agotado: { label: 'Entradas agotadas', className: 'evento-actual__tag--agotado', ctaDisabled: true },
}

// A published, non-sold-out event reads "últimas entradas" once fewer than
// ~15% of its capacity (at least 1 spot) remains — same idea as "cupos
// agotados" from getEventStatus, just one notch earlier.
function getAvailability(event: AdminEvent, status: EventStatus): Availability {
  if (status === 'cupos_agotados') return 'agotado'
  if (event.capacity <= 0) return 'disponible'
  const remaining = event.capacity - event.reservedCount
  const threshold = Math.max(1, Math.ceil(event.capacity * 0.15))
  return remaining <= threshold ? 'ultimas' : 'disponible'
}

function formatWeekdayShort(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  return new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(parsed).replace('.', '').toUpperCase()
}

function formatDayNumber(date: string): string {
  return String(new Date(`${date}T00:00:00`).getDate())
}

function formatDateOnly(date: string | null): string {
  if (!date) return 'Fecha por confirmar'
  const parsed = new Date(`${date}T00:00:00`)
  const label = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(parsed)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function formatTimeOnly(time: string | null): string {
  if (!time) return 'Por confirmar'
  const [hoursStr, minutesStr] = time.split(':')
  const hours24 = Number(hoursStr)
  const period = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours12}:${minutesStr.padStart(2, '0')} ${period}`
}

function toDrawerEvent(event: AdminEvent, status: EventStatus): ReservationDrawerEvent {
  return {
    eventId: event.id,
    images: event.imageUrl ? [event.imageUrl] : [],
    title: event.title,
    statusLabel: status === 'cupos_agotados' ? 'Cupos agotados' : 'Cupos disponibles',
    statusTone: status === 'cupos_agotados' ? 'warning' : 'success',
    dateTime: `${formatDateOnly(event.date)} — ${formatTimeOnly(event.time)}`,
    place: event.place,
    capacityNote: event.requiresRegistration ? `Aforo máximo ${event.capacity} personas.` : 'Evento abierto, aforo libre.',
    price: event.price ?? 0,
    description: event.description,
    requiresRegistration: event.requiresRegistration,
  }
}

export default function Eventos() {
  const { events, pendingDeleteIds } = useAdminEvents()
  const [drawerEvent, setDrawerEvent] = useState<ReservationDrawerEvent | null>(null)

  // Mirrors the admin's own getEventStatus precedence — a borrador never
  // reaches this page because it's always unpublished; "programados" and
  // "próximamente" split the rest of the published events the same way the
  // admin's status filter does.
  const { featured, programados, proximamente } = useMemo(() => {
    const withStatus = events
      .filter((event) => !pendingDeleteIds.includes(event.id))
      .map((event) => ({ event, status: getEventStatus(event) }))

    const featuredEvent = withStatus.find(({ event, status }) => event.featured && status !== 'borrador')?.event ?? null

    // The featured event already gets its own "Evento destacado" section —
    // exclude it here so it doesn't also show up in "Programados"/"Próximamente".
    const programadosList = withStatus
      .filter(({ event, status }) => event.id !== featuredEvent?.id && (status === 'publicado' || status === 'cupos_agotados'))
      .sort((a, b) => (a.event.date ?? '').localeCompare(b.event.date ?? ''))

    const proximamenteList = withStatus
      .filter(({ event, status }) => event.id !== featuredEvent?.id && status === 'proximamente')
      .sort((a, b) => (a.event.date ?? '9999-99-99').localeCompare(b.event.date ?? '9999-99-99'))

    return { featured: featuredEvent, programados: programadosList, proximamente: proximamenteList }
  }, [events, pendingDeleteIds])

  return (
    <>
      <Navbar />

      <main>
        <section className="eventos-hero">
          <span className="eventos-hero__blob eventos-hero__blob--a" aria-hidden="true" />
          <span className="eventos-hero__blob eventos-hero__blob--b" aria-hidden="true" />

          <div className="eventos-hero__inner">
            <div className="eventos-hero__avatars" aria-hidden="true">
              <img src={eventosAvatar1} alt="" className="eventos-hero__avatar" />
              <img src={eventosAvatar2} alt="" className="eventos-hero__avatar" />
            </div>

            <h1 className="eventos-hero__title">Eventos</h1>
            <p className="eventos-hero__lead">
              Historias que también se cuentan en imágenes. Conoce los encuentros, actividades y experiencias que
              dan vida a la misión de la Fundación Un Día Más.
            </p>
          </div>
        </section>

        {featured && (
          <section className="eventos-featured">
            <article className="eventos-featured__card">
              <div className="eventos-featured__body">
                <span className="eventos-featured__tag">Evento Destacado</span>
                <h2>{featured.title}</h2>
                <p className="eventos-featured__text">{featured.description}</p>

                <ul className="eventos-featured__meta">
                  <li>
                    <CalendarIcon />
                    {formatDateOnly(featured.date)} | {formatTimeOnly(featured.time)}
                  </li>
                  <li>
                    <LocationIcon />
                    {featured.place}
                  </li>
                </ul>

                <button
                  type="button"
                  className="btn btn--primary-solid"
                  onClick={() => setDrawerEvent(toDrawerEvent(featured, getEventStatus(featured)))}
                >
                  Quiero saber más
                </button>
              </div>

              <div
                className="eventos-featured__media"
                role="img"
                aria-label={`Foto — ${featured.title}`}
                style={featured.imageUrl ? { backgroundImage: `url(${featured.imageUrl})` } : undefined}
              />
            </article>
          </section>
        )}

        <section className="eventos-actuales">
          <div className="section-heading">
            <h2>Eventos programados</h2>
            <p className="eventos-actuales__lead">
              Explora las actividades que ya están en marcha y únete a las que siguen abiertas.
            </p>
          </div>

          <div className="eventos-actuales__list">
            {programados.length === 0 && (
              <p className="eventos-actuales__lead">No hay eventos programados por el momento.</p>
            )}
            {programados.map(({ event, status }) => {
              const availability = event.requiresRegistration ? AVAILABILITY_META[getAvailability(event, status)] : null
              return (
                <article className="evento-actual" key={event.id}>
                  <div
                    className="evento-actual__media"
                    role="img"
                    aria-label={`Foto — ${event.title}`}
                    style={event.imageUrl ? { backgroundImage: `url(${event.imageUrl})` } : undefined}
                  />
                  <div className="evento-actual__body">
                    {availability ? (
                      <span className={`evento-actual__tag ${availability.className}`}>{availability.label}</span>
                    ) : (
                      <span className="evento-actual__tag evento-actual__tag--abierto">Evento abierto — sin registro</span>
                    )}
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>

                    <dl className="evento-actual__meta">
                      <div>
                        <dt>Lugar</dt>
                        <dd>{event.place}</dd>
                      </div>
                      <div>
                        <dt>Fecha</dt>
                        <dd>{formatDateOnly(event.date)}</dd>
                      </div>
                      <div>
                        <dt>Hora</dt>
                        <dd>{formatTimeOnly(event.time)}</dd>
                      </div>
                    </dl>

                    <button
                      type="button"
                      className="btn btn--primary-solid evento-actual__cta"
                      disabled={availability?.ctaDisabled ?? false}
                      onClick={() => setDrawerEvent(toDrawerEvent(event, status))}
                    >
                      {availability
                        ? availability.ctaDisabled
                          ? 'No disponible'
                          : 'Reservar entrada'
                        : 'Ver detalles'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="eventos-upcoming">
          <div className="section-heading">
            <h2>Próximamente</h2>
            <p className="eventos-upcoming__lead">Encuentra un espacio para ti en nuestras próximas actividades.</p>
          </div>

          <div className="eventos-upcoming__list">
            {proximamente.length === 0 && (
              <p className="eventos-upcoming__lead">No hay anuncios próximamente por el momento.</p>
            )}
            {proximamente.map(({ event }) => {
              const displayTime = `${formatDateOnly(event.date)} | ${formatTimeOnly(event.time)}`
              return (
                <article className="evento-item" key={event.id}>
                  <div className="evento-item__date">
                    <span className="evento-item__weekday">{event.date ? formatWeekdayShort(event.date) : 'PRÓX'}</span>
                    <span className="evento-item__day">{event.date ? formatDayNumber(event.date) : '—'}</span>
                  </div>

                  <p className="evento-item__time evento-item__time--mobile">
                    <ClockIcon />
                    {displayTime}
                  </p>

                  <div
                    className="evento-item__thumb evento-item__thumb--mobile"
                    role="img"
                    aria-label={`Foto — ${event.title}`}
                    style={event.imageUrl ? { backgroundImage: `url(${event.imageUrl})` } : undefined}
                  />

                  <div className="evento-item__body">
                    <p className="evento-item__time evento-item__time--desktop">
                      <ClockIcon />
                      {displayTime}
                    </p>
                    <h3>{event.title}</h3>
                    <p className="evento-item__place">
                      <strong>{event.place}</strong>
                    </p>
                    <p className="evento-item__text">{event.description}</p>
                  </div>

                  <div
                    className="evento-item__thumb evento-item__thumb--desktop"
                    role="img"
                    aria-label={`Foto — ${event.title}`}
                    style={event.imageUrl ? { backgroundImage: `url(${event.imageUrl})` } : undefined}
                  />
                </article>
              )
            })}
          </div>
        </section>
      </main>

      <Footer />

      {drawerEvent && (
        <ReservationDrawer key={drawerEvent.title} event={drawerEvent} onClose={() => setDrawerEvent(null)} />
      )}
    </>
  )
}
