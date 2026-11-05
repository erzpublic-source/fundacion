import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface MailingContact {
  id: string
  nombre: string
  correo: string
  whatsapp: string | null
  ciudad: string | null
  origen: string | null
  active: boolean
  consentAt: number
  unsubscribedAt: number | null
  createdAt: number
}

interface MailingContactRow {
  id: string
  nombre: string
  correo: string
  whatsapp: string | null
  ciudad: string | null
  origen: string | null
  active: boolean
  consent_at: string
  unsubscribed_at: string | null
  created_at: string
}

function toContact(row: MailingContactRow): MailingContact {
  return {
    id: row.id,
    nombre: row.nombre,
    correo: row.correo,
    whatsapp: row.whatsapp,
    ciudad: row.ciudad,
    origen: row.origen,
    active: row.active,
    consentAt: new Date(row.consent_at).getTime(),
    unsubscribedAt: row.unsubscribed_at ? new Date(row.unsubscribed_at).getTime() : null,
    createdAt: new Date(row.created_at).getTime(),
  }
}

interface AdminContactsContextValue {
  contacts: MailingContact[]
  loading: boolean
  unsubscribing: string | null
  ensureSeeded: () => void
  unsubscribeContact: (id: string) => Promise<void>
}

const AdminContactsContext = createContext<AdminContactsContextValue | null>(null)

export function AdminContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<MailingContact[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [unsubscribing, setUnsubscribing] = useState<string | null>(null)

  const loadContacts = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('mailing_contacts').select('*').order('created_at', { ascending: false })
      if (error) {
        console.error(error)
        return
      }
      setContacts((data as MailingContactRow[]).map(toContact))
    } finally {
      setLoading(false)
    }
  }, [])

  const ensureSeeded = useCallback(() => {
    if (contacts !== null) return
    setContacts([])
    void loadContacts()
  }, [contacts, loadContacts])

  const unsubscribeContact = useCallback(async (id: string) => {
    setUnsubscribing(id)
    try {
      const { error } = await supabase
        .from('mailing_contacts')
        .update({ active: false, unsubscribed_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      setContacts((prev) =>
        (prev ?? []).map((c) => (c.id === id ? { ...c, active: false, unsubscribedAt: Date.now() } : c)),
      )
    } finally {
      setUnsubscribing(null)
    }
  }, [])

  const value = useMemo<AdminContactsContextValue>(
    () => ({ contacts: contacts ?? [], loading, unsubscribing, ensureSeeded, unsubscribeContact }),
    [contacts, loading, unsubscribing, ensureSeeded, unsubscribeContact],
  )

  return <AdminContactsContext.Provider value={value}>{children}</AdminContactsContext.Provider>
}

export function useAdminContacts() {
  const ctx = useContext(AdminContactsContext)
  if (!ctx) throw new Error('useAdminContacts must be used within an AdminContactsProvider')
  return ctx
}
