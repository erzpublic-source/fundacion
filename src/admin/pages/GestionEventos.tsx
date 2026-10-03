import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import EventCard from '../components/EventCard'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import UndoToast from '../components/UndoToast'
import { useAdminEvents } from '../AdminEventsContext'
import type { AdminEvent, EventStatus } from '../adminEventsTypes'
import { STATUS_META, STATUS_ORDER, getEventStatus } from '../adminEventsTypes'
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

function StarIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1.2l1.9 4.1 4.4.5-3.3 3 .9 4.3L8 11l-3.9 2.1.9-4.3-3.3-3 4.4-.5L8 1.2Z" />
    </svg>
  )
}

function StarOffIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M8 1.2l1.9 4.1 4.4.5-3.3 3 .9 4.3L8 11l-3.9 2.1.9-4.3-3.3-3 4.4-.5L8 1.2Z" strokeLinejoin="round" />
    </svg>
  )
}

type FilterValue = 'todos' | EventStatus

const DELETE_UNDO_WINDOW_MS = 7000

export default function GestionEventos() {
  const { events, setFeatured, featuring, deleteEvent, deleting, pendingDeleteIds, undoDelete, finalizeDelete } = useAdminEvents()
  const [filter, setFilter] = useState<FilterValue>('todos')
  const [search, setSearch] = useState('')
  const [pendingDelete, setPendingDelete] = useState<AdminEvent | null>(null)
  const [pendingFeature, setPendingFeature] = useState<AdminEvent | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Deleting only *hides* the event (pendingDeleteIds) until the "Deshacer"
  // toast's grace window resolves — unlike the reject-reservation flow, the
  // event isn't fully removed from the store yet, so navigating away before
  // that window closes must finalize it explicitly (see the cleanup below)
  // instead of relying on the store to already hold the final state.
  const [pendingDeleteUndo, setPendingDeleteUndo] = useState<{ id: string; title: string } | null>(null)
  const pendingDeleteUndoIdRef = useRef<string | null>(null)

  useEffect(() => {
    pendingDeleteUndoIdRef.current = pendingDeleteUndo?.id ?? null
  }, [pendingDeleteUndo])

  useEffect(() => {
    return () => {
      if (pendingDeleteUndoIdRef.current) finalizeDelete(pendingDeleteUndoIdRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const eventsWithStatus = useMemo(
    () => events.filter((event) => !pendingDeleteIds.includes(event.id)).map((event) => ({ event, status: getEventStatus(event) })),
    [events, pendingDeleteIds],
  )

  const filters = useMemo<{ value: FilterValue; label: string }[]>(
    () => [{ value: 'todos', label: 'Todos' }, ...STATUS_ORDER.map((status) => ({ value: status, label: STATUS_META[status].label }))],
    [],
  )

  const filterCounts = useMemo(() => {
    const counts: Record<FilterValue, number> = {
      todos: eventsWithStatus.length,
      publicado: 0,
      borrador: 0,
      cupos_agotados: 0,
      proximamente: 0,
      finalizado: 0,
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
  const currentFeatured = events.find((e) => e.featured)

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    const { id, title } = pendingDelete
    await deleteEvent(id)
    setPendingDelete(null)
    setPendingDeleteUndo({ id, title })
  }

  function handleUndoDelete() {
    if (!pendingDeleteUndo) return
    undoDelete(pendingDeleteUndo.id)
    setPendingDeleteUndo(null)
  }

  function handleDismissDeleteToast() {
    if (!pendingDeleteUndo) return
    finalizeDelete(pendingDeleteUndo.id)
    setPendingDeleteUndo(null)
  }

  async function handleConfirmFeatureToggle() {
    if (!pendingFeature) return
    const nextFeatured = !pendingFeature.featured
    await setFeatured(pendingFeature.id, nextFeatured)
    setToastMessage(
      nextFeatured
        ? `'${pendingFeature.title}' ahora es el evento destacado`
        : `'${pendingFeature.title}' ya no es el evento destacado`,
    )
    setPendingFeature(null)
  }

  function featureDialogCopy(event: AdminEvent) {
    if (event.featured) {
      return {
        title: '¿Quitar destacado?',
        description: `Dejará de mostrarse como principal en la página de inicio.`,
      }
    }
    return {
      title: '¿Destacar este evento?',
      description: currentFeatured
        ? `Esto reemplazará a "${currentFeatured.title}" en la página principal.`
        : 'Este evento se mostrará como principal en la página de inicio.',
    }
  }

  return (
    <AdminLayout>
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
          {filters.map((f) => (
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
            <EventCard key={event.id} event={event} onToggleFeatured={setPendingFeature} onDelete={setPendingDelete} />
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

      {pendingDelete && (
        <ConfirmDialog
          tone="danger"
          title="¿Eliminar este evento?"
          description={`"${pendingDelete.title}" se eliminará junto con su configuración, sus reservas y todos los comprobantes de pago asociados. Esta acción no se puede revertir.`}
          confirmLabel="Eliminar"
          loading={deleting === pendingDelete.id}
          onConfirm={handleConfirmDelete}
          onClose={() => setPendingDelete(null)}
        />
      )}

      {pendingFeature && (
        <ConfirmDialog
          tone="warning"
          icon={pendingFeature.featured ? <StarOffIcon /> : <StarIcon />}
          title={featureDialogCopy(pendingFeature).title}
          description={featureDialogCopy(pendingFeature).description}
          confirmLabel={pendingFeature.featured ? 'Quitar destacado' : 'Destacar'}
          loading={featuring === pendingFeature.id}
          onConfirm={handleConfirmFeatureToggle}
          onClose={() => setPendingFeature(null)}
        />
      )}

      {pendingDeleteUndo && (
        <UndoToast
          message={`'${pendingDeleteUndo.title}' eliminado`}
          durationMs={DELETE_UNDO_WINDOW_MS}
          onUndo={handleUndoDelete}
          onDismiss={handleDismissDeleteToast}
        />
      )}

      {toastMessage && !pendingDeleteUndo && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </AdminLayout>
  )
}
