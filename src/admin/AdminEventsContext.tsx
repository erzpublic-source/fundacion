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
   * Deletes the event from Supabase immediately (its discount_codes and
   * reservations go with it, via cascade) and hides it from any visible
   * list via pendingDeleteIds so a "Deshacer" toast can still offer to
   * restore it within its grace window.
   */
  deleteEvent: (id: string) => Promise<void>
  /** Re-inserts a deleted event (and its discount codes) — used by the "Deshacer" toast window. Can't bring back its reservations, already gone via cascade. */
  undoDelete: (id: string) => void
  /** Seals a pending deletion for good once the toast's window expires or the page unmounts before it does — clears local bookkeeping and the event's Storage image. */
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

    function load(markLoading: boolean) {
      if (markLoading) setLoading(true)
      fetchEvents()
        .then((next) => {
          if (!cancelled) setEvents(next)
        })
        .finally(() => {
          if (!cancelled && markLoading) setLoading(false)
        })
    }

    load(true)

    // The browser's back/forward cache can restore this page from a frozen
    // snapshot (no JS re-runs, so the one-time fetch above never happens
    // again) after navigating away and back — e.g. right after editing an
    // event, its new title/image wouldn't show up until a real reload.
    // Refetch whenever that happens, or whenever the tab regains focus
    // after being hidden, so the list can't go stale silently.
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) load(false)
    }
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') load(false)
    }
    window.addEventListener('pageshow', handlePageShow)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      window.removeEventListener('pageshow', handlePageShow)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
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
    try {
      // Deletes for real right away rather than waiting for the "Deshacer"
      // window to close — deferring it meant closing the tab or navigating
      // away before that window elapsed left the row alive in Supabase
      // (so it kept showing on the public site) even though the admin UI
      // already looked like it was gone. undoDelete now re-inserts the row
      // instead of just un-hiding it.
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) throw error
    } catch (error) {
      setPendingDeleteIds((prev) => prev.filter((pendingId) => pendingId !== id))
      throw error
    } finally {
      setDeleting(null)
    }
  }, [])

  const undoDelete = useCallback(
    async (id: string) => {
      const event = events.find((e) => e.id === id)
      setPendingDeleteIds((prev) => prev.filter((pendingId) => pendingId !== id))
      if (!event) return

      const { error } = await supabase.from('events').insert({ id, ...toEventRow(event) })
      if (error) {
        console.error(error)
        return
      }
      if (event.discountCodes.length > 0) {
        await supabase.from('discount_codes').insert(
          event.discountCodes.map((code) => ({
            id: code.id,
            event_id: id,
            code: code.code,
            kind: code.kind,
            value: code.value,
            max_uses: code.maxUses,
            used_count: code.usedCount,
          })),
        )
      }
    },
    [events],
  )

  const finalizeDelete = useCallback(
    (id: string) => {
      const imageUrl = events.find((e) => e.id === id)?.imageUrl
      setEvents((prev) => prev.filter((e) => e.id !== id))
      setPendingDeleteIds((prev) => prev.filter((pendingId) => pendingId !== id))
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
