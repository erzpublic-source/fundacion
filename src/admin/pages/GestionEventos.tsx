import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminHeader from '../components/AdminHeader'
import EventCard from '../components/EventCard'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAdminEvents } from '../AdminEventsContext'
import type { AdminEvent, EventStatus } from '../adminEventsTypes'
import { STATUS_META, getEventStatus } from '../adminEventsTypes'
import '../AdminShared.css'
import './GestionEventos.css'

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="7" cy="7" r="5" />
      <path d="M14 14l-3-3" strokeLinecap="round" />
    </svg>
  )
}

type FilterValue = 'todos' | EventStatus

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'activo', label: STATUS_META.activo.label },
  { value: 'sin_cupos', label: STATUS_META.sin_cupos.label },
  { value: 'proximamente', label: STATUS_META.proximamente.label },
  { value: 'finalizado', label: STATUS_META.finalizado.label },
  { value: 'inactivo', label: STATUS_META.inactivo.label },
]

export default function GestionEventos() {
  const { events, setPublished, deleteEvent, deleting } = useAdminEvents()
  const [filter, setFilter] = useState<FilterValue>('todos')
  const [search, setSearch] = useState('')
  const [pendingDelete, setPendingDelete] = useState<AdminEvent | null>(null)

  const eventsWithStatus = useMemo(
    () => events.map((event) => ({ event, status: getEventStatus(event) })),
    [events],
  )

  const filterCounts = useMemo(() => {
    const counts: Record<FilterValue, number> = {
      todos: eventsWithStatus.length,
      activo: 0,
      sin_cupos: 0,
      proximamente: 0,
      finalizado: 0,
      inactivo: 0,
    }
    eventsWithStatus.forEach(({ status }) => {
      counts[status] += 1
    })
    return counts
  }, [eventsWithStatus])

  const visibleEvents = useMemo(() => {
    const query = search.trim().toLowerCase()
    return eventsWithStatus
      .filter(({ status }) => filter === 'todos' || status === filter)
      .filter(({ event }) => query === '' || event.title.toLowerCase().includes(query))
      .sort((a, b) => b.event.createdAt - a.event.createdAt)
      .map(({ event }) => event)
  }, [eventsWithStatus, filter, search])

  const hasAnyEvents = events.length > 0

  async function handleTogglePublished(event: AdminEvent) {
    await setPublished(event.id, !event.published)
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    await deleteEvent(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <div className="admin-page">
      <AdminHeader />

      <div className="admin-page__body">
        <div className="gestion-eventos__intro">
          <div>
            <h1>Gestión de Eventos</h1>
            <p>Crea, edita y supervisa los encuentros y talleres de la fundación.</p>
          </div>
          <Link to="/admin/eventos/nuevo" className="btn btn--primary gestion-eventos__create">
            + Crear evento
          </Link>
        </div>

        <div className="gestion-eventos__toolbar">
          <div className="gestion-eventos__filters">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                className={`gestion-eventos__filter${filter === f.value ? ' gestion-eventos__filter--active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label} ({filterCounts[f.value]})
              </button>
            ))}
          </div>

          <div className="gestion-eventos__search">
            <SearchIcon />
            <input
              type="search"
              placeholder="Buscar evento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar evento por nombre"
            />
          </div>
        </div>

        {visibleEvents.length > 0 ? (
          <div className="gestion-eventos__grid">
            {visibleEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onTogglePublished={handleTogglePublished}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        ) : !hasAnyEvents ? (
          <EmptyState
            title="Aún no has creado ningún evento"
            description="Los eventos que publiques aparecerán aquí, listos para gestionar cupos y reservas."
            action={
              <Link to="/admin/eventos/nuevo" className="btn btn--primary">
                + Crear tu primer evento
              </Link>
            }
          />
        ) : (
          <EmptyState
            title="No se encontraron eventos con este filtro"
            description="Prueba con otra palabra clave o selecciona un estado diferente."
          />
        )}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          tone="danger"
          title="¿Eliminar este evento?"
          description={`"${pendingDelete.title}" se eliminará junto con su configuración. Esta acción no se puede revertir.`}
          confirmLabel="Eliminar"
          loading={deleting === pendingDelete.id}
          onConfirm={handleConfirmDelete}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
