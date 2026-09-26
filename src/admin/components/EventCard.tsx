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

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M1 8s2.6-5 7-5 7 5 7 5-2.6 5-7 5-7-5-7-5Z" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M1 8s2.6-5 7-5 7 5 7 5-2.6 5-7 5-7-5-7-5Z" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2" />
      <path d="M2 2l12 12" strokeLinecap="round" />
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
  onTogglePublished: (event: AdminEvent) => void
  onDelete: (event: AdminEvent) => void
}

export default function EventCard({ event, onTogglePublished, onDelete }: EventCardProps) {
  const status = getEventStatus(event)
  const statusMeta = STATUS_META[status]
  const occupancy = event.capacity > 0 ? Math.min(100, Math.round((event.reservedCount / event.capacity) * 100)) : 0

  return (
    <article className="event-card">
      <div className="event-card__media" style={event.imageUrl ? { backgroundImage: `url(${event.imageUrl})` } : undefined}>
        {!event.imageUrl && <span className="event-card__media-fallback">Sin imagen</span>}
        <span className={`status-pill event-card__status ${statusMeta.className}`}>{statusMeta.label}</span>
      </div>

      <div className="event-card__body">
        <h3>{event.title}</h3>
        <p className="event-card__schedule">{formatEventSchedule(event.date, event.time)}</p>
        <p className="event-card__place">
          <PlaceIcon /> {event.place}
        </p>

        <div className="event-card__occupancy">
          <div className="event-card__occupancy-bar">
            <span
              className={`event-card__occupancy-fill${status === 'sin_cupos' ? ' event-card__occupancy-fill--full' : ''}`}
              style={{ width: `${occupancy}%` }}
            />
          </div>
          <span className="event-card__occupancy-label">
            {event.reservedCount}/{event.capacity} cupos
          </span>
        </div>

        <p className="event-card__price">{formatPrice(event.kind, event.price)}</p>
      </div>

      <div className="event-card__actions">
        <span className="icon-action">
          <Link to={`/admin/eventos/${event.id}/editar`} className="icon-action__btn" aria-label="Editar evento">
            <EditIcon />
          </Link>
          <span className="icon-action__tooltip">Editar evento</span>
        </span>

        <span className="icon-action">
          <Link to={`/admin/eventos/${event.id}/reservas`} className="icon-action__btn" aria-label="Ver reservas">
            <UsersIcon />
          </Link>
          <span className="icon-action__tooltip">Ver reservas</span>
        </span>

        <span className="icon-action">
          <button
            type="button"
            className={`icon-action__btn${event.published ? ' icon-action__btn--active' : ''}`}
            onClick={() => onTogglePublished(event)}
            aria-label={event.published ? 'Desactivar publicación' : 'Activar publicación'}
          >
            {event.published ? <EyeIcon /> : <EyeOffIcon />}
          </button>
          <span className="icon-action__tooltip">{event.published ? 'Desactivar publicación' : 'Activar publicación'}</span>
        </span>

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
