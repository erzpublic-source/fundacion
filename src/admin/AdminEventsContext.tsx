import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { AdminEvent, DiscountCode } from './adminEventsTypes'

export type EventInput = Omit<AdminEvent, 'id' | 'createdAt' | 'reservedCount'>

interface AdminEventsContextValue {
  events: AdminEvent[]
  /** True until the first fetch from Supabase resolves. */
  loading: boolean
  saving: boolean
  deleting: string | null
  featuring: string | null
  /** Ids currently in their "Deshacer" grace window — hide these from any visible list. */
  pendingDeleteIds: string[]
  getEvent: (id: string) => AdminEvent | undefined
  createEvent: (input: EventInput) => Promise<AdminEvent>
  updateEvent: (id: string, input: EventInput) => Promise<AdminEvent | null>
  setPublished: (id: string, published: boolean) => Promise<void>
  /**
   * Sets or clears the featured flag on one event, unsetting any other
   * currently-featured event first so at most one stays featured — backed
   * by a partial unique index (`UNIQUE (featured) WHERE featured`) on the
   * `events` table as a safety net against a race between two admins.
   */
  setFeatured: (id: string, featured: boolean) => Promise<void>
  /**
   * Marks an event as deleted right away (optimistic — hidden from any
   * visible list via pendingDeleteIds) without yet deleting it from
   * Supabase, so a "Deshacer" toast can restore it within its grace window.
   * The real delete happens in finalizeDelete, once that window closes.
   */
  deleteEvent: (id: string) => Promise<void>
  /** Reverts a pending deletion — used by the "Deshacer" toast window. */
  undoDelete: (id: string) => void
  /** Seals a pending deletion for good — called when the toast's window expires or the page unmounts before it does. */
  finalizeDelete: (id: string) => void
  uploadEventImage: (file: File) => Promise<string>
}

const AdminEventsContext = createContext<AdminEventsContextValue | null>(null)

interface EventRow {
  id: string
  title: string
  description: string
  event_date: string | null
  event_time: string | null
  place: string
  image_url: string | null
  kind: AdminEvent['kind']
  price: number | null
  capacity: number
  published: boolean
  featured: boolean
  is_announcement: boolean
  sales_paused: boolean
  requires_registration: boolean
  created_at: string
  discount_codes: DiscountCodeRow[] | null
}

interface DiscountCodeRow {
  id: string
  code: string
  kind: DiscountCode['kind']
  value: number
  max_uses: number
  used_count: number
}

function toDiscountCode(row: DiscountCodeRow): DiscountCode {
  return { id: row.id, code: row.code, kind: row.kind, value: row.value, maxUses: row.max_uses, usedCount: row.used_count }
}

function toAdminEvent(row: EventRow, reservedCount: number): AdminEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.event_date,
    time: row.event_time ? row.event_time.slice(0, 5) : null,
    place: row.place,
    imageUrl: row.image_url,
    kind: row.kind,
    price: row.price,
    capacity: row.capacity,
    reservedCount,
    published: row.published,
    featured: row.featured,
    isAnnouncement: row.is_announcement,
    salesPaused: row.sales_paused,
    requiresRegistration: row.requires_registration,
    discountCodes: (row.discount_codes ?? []).map(toDiscountCode),
    createdAt: new Date(row.created_at).getTime(),
  }
}

function toEventRow(input: EventInput) {
  return {
    title: input.title,
    description: input.description,
    event_date: input.date,
    event_time: input.time,
    place: input.place,
    image_url: input.imageUrl,
    kind: input.kind,
    price: input.price,
    capacity: input.capacity,
    published: input.published,
    featured: input.featured,
    is_announcement: input.isAnnouncement,
    sales_paused: input.salesPaused,
    requires_registration: input.requiresRegistration,
  }
}

// Supabase public Storage URLs look like
// `.../storage/v1/object/public/event-images/<path>` — extract <path> so it
// can be passed back to storage.remove(). Returns null for anything that
// isn't one of our own event-images URLs (no image, or an old mock
// `blob:`/object URL from before this migration).
function storagePathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const marker = '/object/public/event-images/'
  const index = url.indexOf(marker)
  return index === -1 ? null : url.slice(index + marker.length)
}

async function fetchEvents(): Promise<AdminEvent[]> {
  const [eventsResult, reservationsResult] = await Promise.all([
    supabase.from('events').select('*, discount_codes(*)').order('created_at', { ascending: false }),
    supabase.from('reservations').select('event_id').neq('status', 'rechazado'),
  ])

  if (eventsResult.error) throw eventsResult.error
  if (reservationsResult.error) throw reservationsResult.error

  const reservedCounts = new Map<string, number>()
  for (const row of reservationsResult.data ?? []) {
    reservedCounts.set(row.event_id, (reservedCounts.get(row.event_id) ?? 0) + 1)
  }

  return (eventsResult.data as EventRow[]).map((row) => toAdminEvent(row, reservedCounts.get(row.id) ?? 0))
}

async function replaceDiscountCodes(eventId: string, codes: DiscountCode[]) {
  const { error: deleteError } = await supabase.from('discount_codes').delete().eq('event_id', eventId)
  if (deleteError) throw deleteError
  if (codes.length === 0) return

  const { error: insertError } = await supabase.from('discount_codes').insert(
    codes.map((code) => ({
      event_id: eventId,
      code: code.code,
      kind: code.kind,
      value: code.value,
      max_uses: code.maxUses,
      used_count: code.usedCount,
    })),
  )
  if (insertError) throw insertError
}

export function AdminEventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [featuring, setFeaturing] = useState<string | null>(null)
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    fetchEvents()
      .then((next) => {
        if (!cancelled) setEvents(next)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const getEvent = useCallback((id: string) => events.find((e) => e.id === id), [events])

  const createEvent = useCallback(async (input: EventInput): Promise<AdminEvent> => {
    setSaving(true)
    try {
      const { data, error } = await supabase.from('events').insert(toEventRow(input)).select().single()
      if (error) throw error

      if (input.discountCodes.length > 0) {
        await replaceDiscountCodes(data.id, input.discountCodes)
      }

      const newEvent: AdminEvent = { ...input, id: data.id, reservedCount: 0, createdAt: new Date(data.created_at).getTime() }
      setEvents((prev) => [newEvent, ...prev])
      return newEvent
    } finally {
      setSaving(false)
    }
  }, [])

  const updateEvent = useCallback(async (id: string, input: EventInput): Promise<AdminEvent | null> => {
    setSaving(true)
    try {
      const { data, error } = await supabase.from('events').update(toEventRow(input)).eq('id', id).select().single()
      if (error) throw error

      await replaceDiscountCodes(id, input.discountCodes)

      const existing = events.find((e) => e.id === id)
      if (existing && existing.imageUrl && existing.imageUrl !== input.imageUrl) {
        const oldImagePath = storagePathFromPublicUrl(existing.imageUrl)
        if (oldImagePath) void supabase.storage.from('event-images').remove([oldImagePath])
      }

      const updated: AdminEvent = { ...input, id, reservedCount: existing?.reservedCount ?? 0, createdAt: new Date(data.created_at).getTime() }
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)))
      return updated
      // eslint-disable-next-line react-hooks/exhaustive-deps
    } finally {
      setSaving(false)
    }
  }, [events])

  const setPublished = useCallback(async (id: string, published: boolean) => {
    const { error } = await supabase.from('events').update({ published }).eq('id', id)
    if (error) throw error
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, published } : e)))
  }, [])

  const setFeatured = useCallback(async (id: string, featured: boolean) => {
    setFeaturing(id)
    try {
      if (featured) {
        const { error: clearError } = await supabase.from('events').update({ featured: false }).eq('featured', true)
        if (clearError) throw clearError
      }
      const { error } = await supabase.from('events').update({ featured }).eq('id', id)
      if (error) throw error
      setEvents((prev) => prev.map((e) => ({ ...e, featured: e.id === id ? featured : featured ? false : e.featured })))
    } finally {
      setFeaturing(null)
    }
  }, [])

  const deleteEvent = useCallback(async (id: string) => {
    setDeleting(id)
    setPendingDeleteIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setDeleting(null)
  }, [])

  const undoDelete = useCallback((id: string) => {
    setPendingDeleteIds((prev) => prev.filter((pendingId) => pendingId !== id))
  }, [])

  const finalizeDelete = useCallback(
    (id: string) => {
      const imageUrl = events.find((e) => e.id === id)?.imageUrl
      setEvents((prev) => prev.filter((e) => e.id !== id))
      setPendingDeleteIds((prev) => prev.filter((pendingId) => pendingId !== id))
      // Fire-and-forget: the row (and its discount_codes/reservations, via
      // cascade) is gone from the UI already; if this fails the row simply
      // reappears on the next refresh, which is an acceptable edge case for
      // an admin-only delete.
      void supabase.from('events').delete().eq('id', id)
      const imagePath = storagePathFromPublicUrl(imageUrl)
      if (imagePath) void supabase.storage.from('event-images').remove([imagePath])
    },
    [events],
  )

  const uploadEventImage = useCallback(async (file: File): Promise<string> => {
    const path = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('event-images').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('event-images').getPublicUrl(path)
    return data.publicUrl
  }, [])

  const value = useMemo<AdminEventsContextValue>(
    () => ({
      events,
      loading,
      saving,
      deleting,
      featuring,
      pendingDeleteIds,
      getEvent,
      createEvent,
      updateEvent,
      setPublished,
      setFeatured,
      deleteEvent,
      undoDelete,
      finalizeDelete,
      uploadEventImage,
    }),
    [
      events,
      loading,
      saving,
      deleting,
      featuring,
      pendingDeleteIds,
      getEvent,
      createEvent,
      updateEvent,
      setPublished,
      setFeatured,
      deleteEvent,
      undoDelete,
      finalizeDelete,
      uploadEventImage,
    ],
  )

  return <AdminEventsContext.Provider value={value}>{children}</AdminEventsContext.Provider>
}

export function useAdminEvents() {
  const ctx = useContext(AdminEventsContext)
  if (!ctx) throw new Error('useAdminEvents must be used within an AdminEventsProvider')
  return ctx
}
