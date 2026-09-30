import { Link } from 'react-router-dom'
import type { AdminEvent } from '../adminEventsTypes'
import { STATUS_META, formatEventSchedule, formatPrice, getEventStatus } from '../adminEventsTypes'
import './EventCard.css'

function PlaceIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M8 14.5s5-4.4 5-8.3A5 5 0 0 0 3 6.2c0 3.9 5 8.3 5 8.3Z" strokeLinejoin="round" />
      <circle cx="8" cy="6.2" r="1.8" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M11 2.5 13.5 5 5 13.5 2 14l.5-3L11 2.5Z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="6" cy="5.5" r="2.2" />
      <path d="M2 13.5c.4-2.4 2-3.8 4-3.8s3.6 1.4 4 3.8" strokeLinecap="round" />
      <circle cx="11.3" cy="6" r="1.7" />
      <path d="M10.3 9.9c1.6.15 2.8 1.4 3.1 3.6" strokeLinecap="round" />
    </svg>
  )
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <path d="M8 1.6l1.9 3.9 4.2.6-3 3 .7 4.2L8 11.3l-3.8 2 .7-4.2-3-3 4.2-.6L8 1.6Z" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M2.5 4.5h11M6 4.5v-1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M6.5 7.5v4M9.5 7.5v4M3.5 4.5l.6 8.2a1.5 1.5 0 0 0 1.5 1.3h4.8a1.5 1.5 0 0 0 1.5-1.3l.6-8.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface EventCardProps {
  event: AdminEvent
  onToggleFeatured: (event: AdminEvent) => void
  onDelete: (event: AdminEvent) => void
}

export default function EventCard({ event, onToggleFeatured, onDelete }: EventCardProps) {
  const status = getEventStatus(event)
  const statusMeta = STATUS_META[status]
  const occupancy = event.capacity > 0 ? Math.min(100, Math.round((event.reservedCount / event.capacity) * 100)) : 0

  return (
    <article className={`event-card${event.featured ? ' event-card--featured' : ''}`}>
      <div className="event-card__media" style={event.imageUrl ? { backgroundImage: `url(${event.imageUrl})` } : undefined}>
        {!event.imageUrl && <span className="event-card__media-fallback">Sin imagen</span>}
        {event.featured ? (
          <span className="status-pill status-pill--destacado event-card__status">DESTACADO</span>
        ) : (
          <span className={`status-pill event-card__status ${statusMeta.className}`}>{statusMeta.label}</span>
        )}
        {event.salesPaused && !event.isAnnouncement && (
          <span className="status-pill event-card__paused-badge">⏸ Ventas pausadas</span>
        )}
      </div>

      <div className="event-card__body">
        <h3>{event.title}</h3>
        <p className="event-card__schedule">
          {event.featured && (
            <span className="event-card__featured-star" aria-hidden="true">
              <StarIcon filled />
            </span>
          )}
          {formatEventSchedule(event.date, event.time)}
        </p>
        <p className="event-card__place">
          <PlaceIcon /> {event.place}
        </p>

        {event.requiresRegistration ? (
          <div className="event-card__occupancy">
            <div className="event-card__occupancy-bar">
              <span
                className={`event-card__occupancy-fill event-card__occupancy-fill--${status}`}
                style={{ width: `${occupancy}%` }}
              />
            </div>
            <span className="event-card__occupancy-label">
              {event.reservedCount}/{event.capacity} cupos
            </span>
          </div>
        ) : (
          <span className="event-card__occupancy-label event-card__occupancy-label--open">Aforo libre, sin registro</span>
        )}

        <p className="event-card__price">{formatPrice(event.kind, event.price)}</p>
      </div>

      <div className="event-card__actions">
        <span className="icon-action">
          <Link to={`/admin/eventos/${event.id}/editar`} className="icon-action__btn" aria-label="Editar evento">
            <EditIcon />
          </Link>
          <span className="icon-action__tooltip">Editar evento</span>
        </span>

        {status !== 'borrador' && status !== 'proximamente' && event.requiresRegistration && (
          <span className="icon-action">
            <Link to={`/admin/eventos/${event.id}/reservas`} className="icon-action__btn" aria-label="Ver reservas">
              <UsersIcon />
            </Link>
            <span className="icon-action__tooltip">Ver reservas</span>
          </span>
        )}

        {status !== 'borrador' && (
          <span className="icon-action">
            <button
              type="button"
              className={`icon-action__btn icon-action__btn--star${event.featured ? ' icon-action__btn--active' : ''}`}
              onClick={() => onToggleFeatured(event)}
              aria-label={event.featured ? 'Quitar destacado' : 'Destacar evento'}
            >
              <StarIcon filled={event.featured} />
            </button>
            <span className="icon-action__tooltip">{event.featured ? 'Quitar destacado' : 'Destacar evento'}</span>
          </span>
        )}

        <span className="icon-action">
          <button
            type="button"
            className="icon-action__btn icon-action__btn--danger"
            onClick={() => onDelete(event)}
            aria-label="Eliminar evento"
          >
            <TrashIcon />
          </button>
          <span className="icon-action__tooltip">Eliminar evento</span>
        </span>
      </div>
    </article>
  )
}
