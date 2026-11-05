import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAdminContacts } from '../AdminContactsContext'
import type { MailingContact } from '../AdminContactsContext'
import '../AdminShared.css'
import './Contactos.css'

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="7" cy="7" r="5" />
      <path d="M14 14l-3-3" strokeLinecap="round" />
    </svg>
  )
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

type TabValue = 'todos' | 'activo' | 'baja'

export default function Contactos() {
  const { contacts, loading, unsubscribing, ensureSeeded, unsubscribeContact } = useAdminContacts()

  useEffect(() => {
    ensureSeeded()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [tab, setTab] = useState<TabValue>('todos')
  const [search, setSearch] = useState('')
  const [pendingUnsubscribe, setPendingUnsubscribe] = useState<MailingContact | null>(null)

  const counts = useMemo(
    () => ({
      todos: contacts.length,
      activo: contacts.filter((c) => c.active).length,
      baja: contacts.filter((c) => !c.active).length,
    }),
    [contacts],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return contacts
      .filter((c) => tab === 'todos' || (tab === 'activo' ? c.active : !c.active))
      .filter((c) => query === '' || c.nombre.toLowerCase().includes(query) || c.correo.toLowerCase().includes(query))
  }, [contacts, tab, search])

  async function handleConfirmUnsubscribe() {
    if (!pendingUnsubscribe) return
    await unsubscribeContact(pendingUnsubscribe.id)
    setPendingUnsubscribe(null)
  }

  const tabs: { value: TabValue; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'activo', label: 'Activos' },
    { value: 'baja', label: 'Dados de baja' },
  ]

  return (
    <AdminLayout>
      <div className="contactos-page">
        <div className="contactos-page__intro">
          <h1>Contactos</h1>
          <p>Personas que aceptaron recibir información de futuros eventos de la Fundación.</p>
        </div>

        <div className="contactos-toolbar">
          <div className="contactos-toolbar__tabs">
            {tabs.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`contactos-toolbar__tab${tab === t.value ? ' contactos-toolbar__tab--active' : ''}`}
                onClick={() => setTab(t.value)}
              >
                {t.label} ({counts[t.value]})
              </button>
            ))}
          </div>

          <div className="contactos-toolbar__search">
            <SearchIcon />
            <input
              type="search"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar contacto por nombre o correo"
            />
          </div>
        </div>

        {loading && contacts.length === 0 ? (
          <EmptyState title="Cargando contactos..." description="Un momento." />
        ) : filtered.length > 0 ? (
          <div className="contactos-table">
            <div className="contactos-table__head">
              <span>Nombre</span>
              <span>Correo</span>
              <span>WhatsApp</span>
              <span>Ciudad</span>
              <span>Origen</span>
              <span>Fecha</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>

            {filtered.map((c) => (
              <div className="contactos-table__row" key={c.id}>
                <div className="contactos-table__cell" data-label="Nombre">
                  <strong>{c.nombre}</strong>
                </div>
                <div className="contactos-table__cell" data-label="Correo" title={c.correo}>
                  {c.correo}
                </div>
                <div className="contactos-table__cell" data-label="WhatsApp">
                  {c.whatsapp || '—'}
                </div>
                <div className="contactos-table__cell" data-label="Ciudad">
                  {c.ciudad || '—'}
                </div>
                <div className="contactos-table__cell" data-label="Origen">
                  {c.origen || '—'}
                </div>
                <div className="contactos-table__cell" data-label="Fecha">
                  {formatDate(c.consentAt)}
                </div>
                <div className="contactos-table__cell" data-label="Estado">
                  <span className={`status-pill ${c.active ? 'reserva-status--aprobado' : 'reserva-status--rechazado'}`}>
                    {c.active ? 'Activo' : 'Dado de baja'}
                  </span>
                </div>
                <div className="contactos-table__cell contactos-table__cell--actions" data-label="Acciones">
                  {c.active && (
                    <button
                      type="button"
                      className="btn contactos-table__action"
                      onClick={() => setPendingUnsubscribe(c)}
                    >
                      Dar de baja
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aún no hay contactos"
            description="Aparecerán aquí las personas que marquen la casilla de recibir información de eventos al reservar."
          />
        )}

        {pendingUnsubscribe && (
          <ConfirmDialog
            tone="danger"
            title="¿Dar de baja a este contacto?"
            description={`${pendingUnsubscribe.nombre} (${pendingUnsubscribe.correo}) ya no recibirá correos de invitación a futuros eventos. Úsalo cuando alguien lo pida por otro canal (WhatsApp, en persona).`}
            confirmLabel="Dar de baja"
            loading={unsubscribing === pendingUnsubscribe.id}
            onConfirm={handleConfirmUnsubscribe}
            onClose={() => setPendingUnsubscribe(null)}
          />
        )}
      </div>
    </AdminLayout>
  )
}
