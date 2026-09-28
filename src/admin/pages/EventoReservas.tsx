import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ReceiptModal from '../components/ReceiptModal'
import TicketApprovedModal from '../components/TicketApprovedModal'
import RejectUndoToast from '../components/RejectUndoToast'
import { useAdminEvents } from '../AdminEventsContext'
import { useAdminReservations } from '../AdminReservationsContext'
import type { Reservation, ReservationStatus } from '../reservationsTypes'
import { RESERVATION_STATUS_META, formatReservationAmount } from '../reservationsTypes'
import '../AdminAuth.css'
import '../AdminShared.css'
import './EventoReservas.css'

const UNDO_WINDOW_MS = 7000
const PAGE_SIZE = 6

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="7" cy="7" r="5" />
      <path d="M14 14l-3-3" strokeLinecap="round" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M4 1.5h5.5L12.5 4.5V14a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5Z" strokeLinejoin="round" />
      <path d="M9.2 1.5V4.5h3" strokeLinejoin="round" />
    </svg>
  )
}

function TicketTagIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M2 6.5V3a1 1 0 0 1 1-1h3.5l7 7-4.5 4.5-7-7Z" strokeLinejoin="round" />
      <circle cx="5" cy="5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M3 10.5V3.5A1.5 1.5 0 0 1 4.5 2h7" strokeLinecap="round" />
    </svg>
  )
}

function CheckSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M10 3 5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function OccupancyRing({ percent }: { percent: number }) {
  const radius = 15
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, percent))
  const offset = circumference * (1 - clamped / 100)

  return (
    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r={radius} fill="none" stroke="#ece7ef" strokeWidth="4" />
      <circle
        cx="18"
        cy="18"
        r={radius}
        fill="none"
        stroke="var(--color-violeta-esperanza)"
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 18 18)"
      />
    </svg>
  )
}

type TabValue = 'todas' | ReservationStatus

type ConfirmAction = { type: 'approve' | 'reject'; reservation: Reservation }

// TODO(Supabase): swap the whole reservations mock (AdminReservationsContext
// + mockReservationsSeed) for `select`/`update` calls against a real
// `reservations` table once Supabase is connected — nothing in this
// component's own logic should need to change, only the context's guts.
export default function EventoReservas() {
  const { id } = useParams<{ id: string }>()
  const { getEvent } = useAdminEvents()
  const event = id ? getEvent(id) : undefined

  const { ensureSeeded, reservationsFor, approving, rejecting, approveReservation, rejectReservation, undoReject } =
    useAdminReservations()

  useEffect(() => {
    if (id) ensureSeeded(id, event?.price ?? 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const reservations = id ? reservationsFor(id) : []

  const [tab, setTab] = useState<TabValue>('todas')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [viewReceipt, setViewReceipt] = useState<Reservation | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [approvedResult, setApprovedResult] = useState<{ name: string; code: string } | null>(null)
  const [pendingUndo, setPendingUndo] = useState<{ id: string; name: string } | null>(null)
  const undoTimerRef = useRef<number | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const copiedTimerRef = useRef<number | null>(null)

  // The rejection itself is already applied to the shared store the instant
  // it's confirmed (see handleConfirmReject) — this cleanup only has to stop
  // the dangling JS timer on unmount, not "finalize" anything: the store
  // keeps the rejection sealed on its own since it lives above the router's
  // page-remount boundary (see App.tsx).
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
      if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current)
    }
  }, [])

  const counts = useMemo(
    () => ({
      todas: reservations.length,
      pendiente: reservations.filter((r) => r.status === 'pendiente').length,
      aprobado: reservations.filter((r) => r.status === 'aprobado').length,
      rechazado: reservations.filter((r) => r.status === 'rechazado').length,
    }),
    [reservations],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return reservations
      .filter((r) => tab === 'todas' || r.status === tab)
      .filter((r) => query === '' || r.attendeeName.toLowerCase().includes(query) || r.email.toLowerCase().includes(query))
  }, [reservations, tab, search])

  useEffect(() => {
    setPage(1)
  }, [tab, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const occupancyPercent = event && event.capacity > 0 ? (counts.aprobado / event.capacity) * 100 : 0

  function openReceipt(reservation: Reservation) {
    setViewReceipt(reservation)
  }

  async function handleCopyCode(reservation: Reservation) {
    if (!reservation.ticketCode) return
    try {
      await navigator.clipboard.writeText(reservation.ticketCode)
      setCopiedId(reservation.id)
      if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current)
      copiedTimerRef.current = window.setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Clipboard access can be denied by the browser — the code is already
      // visible on screen, so there's nothing further to recover here.
    }
  }

  function requestApprove(reservation: Reservation) {
    setViewReceipt(null)
    setConfirmAction({ type: 'approve', reservation })
  }

  function requestReject(reservation: Reservation) {
    setViewReceipt(null)
    setConfirmAction({ type: 'reject', reservation })
  }

  async function handleConfirmApprove() {
    if (!confirmAction || !id) return
    const code = await approveReservation(id, confirmAction.reservation.id)
    setApprovedResult({ name: confirmAction.reservation.attendeeName, code })
    setConfirmAction(null)
  }

  async function handleConfirmReject() {
    if (!confirmAction || !id) return
    const { reservation } = confirmAction
    await rejectReservation(id, reservation.id)
    setConfirmAction(null)

    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    setPendingUndo({ id: reservation.id, name: reservation.attendeeName })
    undoTimerRef.current = window.setTimeout(() => {
      setPendingUndo(null)
      undoTimerRef.current = null
    }, UNDO_WINDOW_MS)
  }

  function handleUndoReject() {
    if (!pendingUndo || !id) return
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current)
      undoTimerRef.current = null
    }
    undoReject(id, pendingUndo.id)
    setPendingUndo(null)
  }

  function handleDismissRejectToast() {
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current)
      undoTimerRef.current = null
    }
    setPendingUndo(null)
  }

  if (id && !event) {
    return (
      <AdminLayout>
        <p>No encontramos ese evento.</p>
        <Link to="/admin/eventos" className="admin-link">
          Volver a Gestión de Eventos
        </Link>
      </AdminLayout>
    )
  }

  const tabs: { value: TabValue; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'aprobado', label: 'Aprobado' },
    { value: 'rechazado', label: 'Rechazado' },
  ]

  return (
    <AdminLayout>
      <div className="reservas-page">
        <p className="event-form__breadcrumb">
          EVENTOS &gt; {(event?.title ?? 'EVENTO').split(' ')[0].toUpperCase()} &gt; RESERVAS
        </p>
        <h1 className="event-form__title">{event?.title ?? 'Evento'}</h1>
        <p className="event-form__subtitle">Monitoree y gestione las confirmaciones de pago de los asistentes inscritos.</p>

        <div className="reservas-summary">
          <div className="reservas-summary__card">
            <span className="reservas-summary__label">Entradas ocupadas</span>
            <div className="reservas-summary__value-row">
              <strong>
                {counts.aprobado}/{event?.capacity ?? 0}
              </strong>
              <OccupancyRing percent={occupancyPercent} />
            </div>
          </div>

          <div className="reservas-summary__card">
            <span className="reservas-summary__label">Pendientes</span>
            <div className="reservas-summary__value-row">
              <span className="reservas-summary__dot reservas-summary__dot--pendiente" />
              <strong>{counts.pendiente}</strong>
            </div>
          </div>

          <div className="reservas-summary__card">
            <span className="reservas-summary__label">Aprobadas</span>
            <div className="reservas-summary__value-row">
              <span className="reservas-summary__dot reservas-summary__dot--aprobado" />
              <strong>{counts.aprobado}</strong>
            </div>
          </div>

          <div className="reservas-summary__card">
            <span className="reservas-summary__label">Rechazadas</span>
            <div className="reservas-summary__value-row">
              <span className="reservas-summary__dot reservas-summary__dot--rechazado" />
              <strong>{counts.rechazado}</strong>
            </div>
          </div>
        </div>

        <div className="reservas-toolbar">
          <div className="reservas-toolbar__tabs">
            {tabs.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`reservas-toolbar__tab${tab === t.value ? ' reservas-toolbar__tab--active' : ''}`}
                onClick={() => setTab(t.value)}
              >
                {t.label} ({counts[t.value]})
              </button>
            ))}
          </div>

          <div className="reservas-toolbar__search">
            <SearchIcon />
            <input
              type="search"
              placeholder="Buscar asistente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar asistente por nombre o correo"
            />
          </div>
        </div>

        {pageItems.length > 0 ? (
          <>
            <div className="reservas-table">
              <div className="reservas-table__head">
                <span>Asistente</span>
                <span>Correo electrónico</span>
                <span>Valor pagado</span>
                <span>Comprobante</span>
                <span>Estado</span>
                <span>Acciones</span>
              </div>

              {pageItems.map((r) => {
                const statusMeta = RESERVATION_STATUS_META[r.status]
                return (
                  <div className="reservas-table__row" key={r.id}>
                    <div className="reservas-table__cell" data-label="Asistente">
                      <strong>{r.attendeeName}</strong>
                    </div>

                    <div className="reservas-table__cell reservas-table__cell--email" data-label="Correo electrónico" title={r.email}>
                      {r.email}
                    </div>

                    <div className="reservas-table__cell" data-label="Valor pagado">
                      {formatReservationAmount(r.amountPaid)}
                    </div>

                    <div className="reservas-table__cell" data-label="Comprobante">
                      <button type="button" className="reservas-table__receipt-link" onClick={() => openReceipt(r)}>
                        <DocIcon /> Ver
                      </button>
                    </div>

                    <div className="reservas-table__cell" data-label="Estado">
                      <span className={`status-pill ${statusMeta.className}`}>{statusMeta.label}</span>
                    </div>

                    <div className="reservas-table__cell reservas-table__cell--actions" data-label="Acciones">
                      {r.status === 'pendiente' ? (
                        <>
                          <button
                            type="button"
                            className="btn reservas-table__action reservas-table__action--reject"
                            onClick={() => requestReject(r)}
                          >
                            Rechazar
                          </button>
                          <button
                            type="button"
                            className="btn reservas-table__action reservas-table__action--approve"
                            onClick={() => requestApprove(r)}
                          >
                            Aprobar
                          </button>
                        </>
                      ) : r.status === 'aprobado' && r.ticketCode ? (
                        <span className="reservas-table__ticket-code">
                          <TicketTagIcon />
                          {r.ticketCode}
                          <button
                            type="button"
                            className="reservas-table__copy-btn"
                            onClick={() => handleCopyCode(r)}
                            aria-label={`Copiar código ${r.ticketCode}`}
                            title={copiedId === r.id ? '¡Copiado!' : 'Copiar código'}
                          >
                            {copiedId === r.id ? <CheckSmallIcon /> : <CopyIcon />}
                          </button>
                        </span>
                      ) : (
                        <span className="reservas-table__no-action">—</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="reservas-pagination">
              <span>
                Mostrando {pageItems.length} de {filtered.length} reservas totales
              </span>
              <div className="reservas-pagination__controls">
                <button
                  type="button"
                  className="reservas-pagination__btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Página anterior"
                >
                  <ChevronLeftIcon />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`reservas-pagination__btn${p === currentPage ? ' reservas-pagination__btn--active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  className="reservas-pagination__btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Página siguiente"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title={reservations.length === 0 ? 'Aún no hay reservas para este evento' : 'No se encontraron reservas'}
            description={
              reservations.length === 0
                ? 'Las reservas de los asistentes aparecerán aquí a medida que se inscriban.'
                : 'Prueba con otra palabra clave o selecciona un estado diferente.'
            }
          />
        )}
      </div>

      {viewReceipt && (
        <ReceiptModal
          reservation={viewReceipt}
          onClose={() => setViewReceipt(null)}
          onRequestApprove={requestApprove}
          onRequestReject={requestReject}
        />
      )}

      {confirmAction?.type === 'approve' && (
        <ConfirmDialog
          tone="confirm"
          title="¿Desea aprobar la compra de la entrada?"
          description="Al confirmar, se procesará la solicitud y no podrá deshacerse. Verifique los datos antes de continuar."
          confirmLabel="Confirmar"
          loading={approving === confirmAction.reservation.id}
          onConfirm={handleConfirmApprove}
          onClose={() => setConfirmAction(null)}
        />
      )}

      {confirmAction?.type === 'reject' && (
        <ConfirmDialog
          tone="danger"
          title="¿Desea rechazar la compra de la entrada?"
          description="Al rechazar, la solicitud será descartada permanentemente. Esta acción no se puede revertir."
          confirmLabel="Confirmar"
          loading={rejecting === confirmAction.reservation.id}
          onConfirm={handleConfirmReject}
          onClose={() => setConfirmAction(null)}
        />
      )}

      {approvedResult && (
        <TicketApprovedModal
          attendeeName={approvedResult.name}
          ticketCode={approvedResult.code}
          onClose={() => setApprovedResult(null)}
        />
      )}

      {pendingUndo && (
        <RejectUndoToast
          attendeeName={pendingUndo.name}
          durationMs={UNDO_WINDOW_MS}
          onUndo={handleUndoReject}
          onDismiss={handleDismissRejectToast}
        />
      )}
    </AdminLayout>
  )
}
