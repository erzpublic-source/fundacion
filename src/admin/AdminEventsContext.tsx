import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AdminEvent } from './adminEventsTypes'
import { createSeedEvents } from './mockEventsSeed'

// TODO(Supabase): this cap exists ONLY because the mock store keeps
// everything in memory for this in-browser demo. Drop it entirely once
// `events` is a real Supabase table — a production table has no row limit,
// and the "evict the oldest" behavior below must not be ported over.
const MAX_MOCK_EVENTS = 50

const MOCK_LATENCY_MS = 700

export type EventInput = Omit<AdminEvent, 'id' | 'createdAt' | 'reservedCount'>

interface AdminEventsContextValue {
  events: AdminEvent[]
  saving: boolean
  deleting: string | null
  getEvent: (id: string) => AdminEvent | undefined
  // TODO(Supabase): replace with `supabase.from('events').insert(...)`.
  createEvent: (input: EventInput) => Promise<AdminEvent>
  // TODO(Supabase): replace with `supabase.from('events').update(...).eq('id', id)`.
  updateEvent: (id: string, input: EventInput) => Promise<AdminEvent | null>
  // TODO(Supabase): replace with `supabase.from('events').update({ published }).eq('id', id)`.
  setPublished: (id: string, published: boolean) => Promise<void>
  // TODO(Supabase): replace with `supabase.from('events').delete().eq('id', id)`.
  deleteEvent: (id: string) => Promise<void>
  // TODO(Supabase): replace with an upload to Storage (bucket "event-images")
  // followed by `getPublicUrl`; this mock just returns a local object URL.
  uploadEventImage: (file: File) => Promise<string>
}

const AdminEventsContext = createContext<AdminEventsContextValue | null>(null)

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function makeId(): string {
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function AdminEventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AdminEvent[]>(() => createSeedEvents())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const getEvent = useCallback((id: string) => events.find((e) => e.id === id), [events])

  const createEvent = useCallback(async (input: EventInput): Promise<AdminEvent> => {
    setSaving(true)
    await wait(MOCK_LATENCY_MS)

    const newEvent: AdminEvent = { ...input, id: makeId(), reservedCount: 0, createdAt: Date.now() }

    setEvents((prev) => {
      // FIFO eviction — see the TODO(Supabase) above MAX_MOCK_EVENTS.
      const withNew = [...prev, newEvent]
      if (withNew.length <= MAX_MOCK_EVENTS) return withNew
      const oldestFirst = [...withNew].sort((a, b) => a.createdAt - b.createdAt)
      const toDrop = new Set(oldestFirst.slice(0, withNew.length - MAX_MOCK_EVENTS).map((e) => e.id))
      return withNew.filter((e) => !toDrop.has(e.id))
    })

    setSaving(false)
    return newEvent
  }, [])

  const updateEvent = useCallback(async (id: string, input: EventInput): Promise<AdminEvent | null> => {
    setSaving(true)
    await wait(MOCK_LATENCY_MS)

    let updated: AdminEvent | null = null
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e
        updated = { ...e, ...input }
        return updated
      }),
    )

    setSaving(false)
    return updated
  }, [])

  const setPublished = useCallback(async (id: string, published: boolean) => {
    await wait(300)
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, published } : e)))
  }, [])

  const deleteEvent = useCallback(async (id: string) => {
    setDeleting(id)
    await wait(MOCK_LATENCY_MS)
    setEvents((prev) => prev.filter((e) => e.id !== id))
    setDeleting(null)
  }, [])

  const uploadEventImage = useCallback(async (file: File): Promise<string> => {
    await wait(900)
    return URL.createObjectURL(file)
  }, [])

  const value = useMemo<AdminEventsContextValue>(
    () => ({ events, saving, deleting, getEvent, createEvent, updateEvent, setPublished, deleteEvent, uploadEventImage }),
    [events, saving, deleting, getEvent, createEvent, updateEvent, setPublished, deleteEvent, uploadEventImage],
  )

  return <AdminEventsContext.Provider value={value}>{children}</AdminEventsContext.Provider>
}

export function useAdminEvents() {
  const ctx = useContext(AdminEventsContext)
  if (!ctx) throw new Error('useAdminEvents must be used within an AdminEventsProvider')
  return ctx
}
