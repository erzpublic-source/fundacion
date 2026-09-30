import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Reservation } from './reservationsTypes'
import { createSeedReservations, nextTicketCode } from './mockReservationsSeed'

const MOCK_LATENCY_MS = 700

interface AdminReservationsContextValue {
  approving: string | null
  rejecting: string | null
  creating: boolean
  /** Seeds the mock reservation list for an event the first time its Reservas screen loads; a no-op afterwards. */
  ensureSeeded: (eventId: string, unitPrice: number) => void
  reservationsFor: (eventId: string) => Reservation[]
  // TODO(Supabase): supabase.from('reservations').insert([...]) — one row per
  // ticket — plus the receipt upload to Storage once that's wired in.
  createReservation: (input: CreateReservationInput) => Promise<void>
  // TODO(Supabase): supabase.from('reservations').update({ status: 'aprobado' }).eq('id', id), then insert the generated code into a `tickets` table.
  approveReservation: (eventId: string, id: string) => Promise<string>
  // TODO(Supabase): supabase.from('reservations').update({ status: 'rechazado' }).eq('id', id).
  rejectReservation: (eventId: string, id: string) => Promise<void>
  /** Reverts a rejection back to "pendiente" — used by the "Deshacer" toast window; idempotent past that window. */
  undoReject: (eventId: string, id: string) => void
}

const AdminReservationsContext = createContext<AdminReservationsContextValue | null>(null)

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

// Distinct counter from mockReservationsSeed's own `reservationId()` — this
// one is for reservations actually created through the public booking flow,
// so ids never collide with the demo seed rows.
let newReservationSeq = 0
function newReservationId(): string {
  newReservationSeq += 1
  return `res-${Date.now().toString(36)}-${newReservationSeq}`
}

export interface CreateReservationInput {
  eventId: string
  /** One name per ticket — the buyer counts as the first attendee. */
  attendeeNames: string[]
  email: string
  /** Amount paid per ticket (total already split across attendeeNames.length). */
  amountPerAttendee: number
}

export function AdminReservationsProvider({ children }: { children: ReactNode }) {
  const [byEvent, setByEvent] = useState<Record<string, Reservation[]>>({})
  const [approving, setApproving] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const ensureSeeded = useCallback((eventId: string, unitPrice: number) => {
    setByEvent((prev) => (prev[eventId] ? prev : { ...prev, [eventId]: createSeedReservations(eventId, unitPrice) }))
  }, [])

  const reservationsFor = useCallback((eventId: string) => byEvent[eventId] ?? [], [byEvent])

  const createReservation = useCallback(async ({ eventId, attendeeNames, email, amountPerAttendee }: CreateReservationInput) => {
    setCreating(true)
    await wait(MOCK_LATENCY_MS)
    const newRows: Reservation[] = attendeeNames.map((attendeeName) => ({
      id: newReservationId(),
      eventId,
      attendeeName,
      email,
      amountPaid: amountPerAttendee,
      status: 'pendiente',
      ticketCode: null,
      createdAt: Date.now(),
    }))
    setByEvent((prev) => ({ ...prev, [eventId]: [...(prev[eventId] ?? []), ...newRows] }))
    setCreating(false)
  }, [])

  const approveReservation = useCallback(async (eventId: string, id: string): Promise<string> => {
    setApproving(id)
    await wait(MOCK_LATENCY_MS)
    const code = nextTicketCode()
    setByEvent((prev) => ({
      ...prev,
      [eventId]: (prev[eventId] ?? []).map((r) => (r.id === id ? { ...r, status: 'aprobado', ticketCode: code } : r)),
    }))
    setApproving(null)
    return code
  }, [])

  const rejectReservation = useCallback(async (eventId: string, id: string) => {
    setRejecting(id)
    await wait(MOCK_LATENCY_MS)
    setByEvent((prev) => ({
      ...prev,
      [eventId]: (prev[eventId] ?? []).map((r) => (r.id === id ? { ...r, status: 'rechazado' } : r)),
    }))
    setRejecting(null)
  }, [])

  const undoReject = useCallback((eventId: string, id: string) => {
    setByEvent((prev) => ({
      ...prev,
      [eventId]: (prev[eventId] ?? []).map((r) => (r.id === id && r.status === 'rechazado' ? { ...r, status: 'pendiente' } : r)),
    }))
  }, [])

  const value = useMemo<AdminReservationsContextValue>(
    () => ({
      approving,
      rejecting,
      creating,
      ensureSeeded,
      reservationsFor,
      createReservation,
      approveReservation,
      rejectReservation,
      undoReject,
    }),
    [approving, rejecting, creating, ensureSeeded, reservationsFor, createReservation, approveReservation, rejectReservation, undoReject],
  )

  return <AdminReservationsContext.Provider value={value}>{children}</AdminReservationsContext.Provider>
}

export function useAdminReservations() {
  const ctx = useContext(AdminReservationsContext)
  if (!ctx) throw new Error('useAdminReservations must be used within an AdminReservationsProvider')
  return ctx
}
