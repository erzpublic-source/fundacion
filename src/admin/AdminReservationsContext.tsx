import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Reservation } from './reservationsTypes'

interface AdminReservationsContextValue {
  approving: string | null
  rejecting: string | null
  creating: boolean
  /** Loads the reservation list for an event the first time its Reservas screen opens; a no-op afterwards. */
  ensureSeeded: (eventId: string) => void
  reservationsFor: (eventId: string) => Reservation[]
  createReservation: (input: CreateReservationInput) => Promise<void>
  approveReservation: (eventId: string, id: string) => Promise<string>
  rejectReservation: (eventId: string, id: string) => Promise<void>
  /** Reverts a rejection back to "pendiente" — used by the "Deshacer" toast window; idempotent past that window. */
  undoReject: (eventId: string, id: string) => void
}

const AdminReservationsContext = createContext<AdminReservationsContextValue | null>(null)

interface ReservationRow {
  id: string
  event_id: string
  attendee_name: string
  email: string
  amount_paid: number
  status: Reservation['status']
  ticket_code: string | null
  created_at: string
}

function toReservation(row: ReservationRow): Reservation {
  return {
    id: row.id,
    eventId: row.event_id,
    attendeeName: row.attendee_name,
    email: row.email,
    amountPaid: row.amount_paid,
    status: row.status,
    ticketCode: row.ticket_code,
    createdAt: new Date(row.created_at).getTime(),
  }
}

function generateTicketCode(): string {
  return `#ENT-${Date.now().toString(36).toUpperCase().slice(-6)}`
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

  const loadReservations = useCallback(async (eventId: string) => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    if (error) {
      console.error(error)
      return
    }
    setByEvent((prev) => ({ ...prev, [eventId]: (data as ReservationRow[]).map(toReservation) }))
  }, [])

  const ensureSeeded = useCallback(
    (eventId: string) => {
      setByEvent((prev) => {
        if (prev[eventId]) return prev
        void loadReservations(eventId)
        return { ...prev, [eventId]: [] }
      })
    },
    [loadReservations],
  )

  const reservationsFor = useCallback((eventId: string) => byEvent[eventId] ?? [], [byEvent])

  const createReservation = useCallback(async ({ eventId, attendeeNames, email, amountPerAttendee }: CreateReservationInput) => {
    setCreating(true)
    try {
      // No .select() here on purpose: this runs from the public booking flow
      // (anonymous visitor), and the `reservations` read policy only allows
      // an authenticated admin — PostgREST would just hand back an empty
      // result for the insert's own representation, which nothing here uses.
      const { error } = await supabase.from('reservations').insert(
        attendeeNames.map((attendeeName) => ({
          event_id: eventId,
          attendee_name: attendeeName,
          email,
          amount_paid: amountPerAttendee,
          status: 'pendiente',
        })),
      )
      if (error) throw error
    } finally {
      setCreating(false)
    }
  }, [])

  const approveReservation = useCallback(async (eventId: string, id: string): Promise<string> => {
    setApproving(id)
    try {
      const code = generateTicketCode()
      const { error } = await supabase.from('reservations').update({ status: 'aprobado', ticket_code: code }).eq('id', id)
      if (error) throw error
      setByEvent((prev) => ({
        ...prev,
        [eventId]: (prev[eventId] ?? []).map((r) => (r.id === id ? { ...r, status: 'aprobado', ticketCode: code } : r)),
      }))
      return code
    } finally {
      setApproving(null)
    }
  }, [])

  const rejectReservation = useCallback(async (eventId: string, id: string) => {
    setRejecting(id)
    try {
      const { error } = await supabase.from('reservations').update({ status: 'rechazado' }).eq('id', id)
      if (error) throw error
      setByEvent((prev) => ({
        ...prev,
        [eventId]: (prev[eventId] ?? []).map((r) => (r.id === id ? { ...r, status: 'rechazado' } : r)),
      }))
    } finally {
      setRejecting(null)
    }
  }, [])

  const undoReject = useCallback((eventId: string, id: string) => {
    setByEvent((prev) => ({
      ...prev,
      [eventId]: (prev[eventId] ?? []).map((r) => (r.id === id && r.status === 'rechazado' ? { ...r, status: 'pendiente' } : r)),
    }))
    void supabase.from('reservations').update({ status: 'pendiente' }).eq('id', id)
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
