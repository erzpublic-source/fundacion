import { Link, useParams } from 'react-router-dom'
import AdminHeader from '../components/AdminHeader'
import { useAdminEvents } from '../AdminEventsContext'
import '../AdminAuth.css'
import '../AdminShared.css'
import './EventForm.css'

// Stands in for the reservations-management module (approve/reject
// payment receipts, per the mockups) — the next milestone after this one.
export default function EventoReservasStub() {
  const { id } = useParams<{ id: string }>()
  const { getEvent } = useAdminEvents()
  const event = id ? getEvent(id) : undefined

  return (
    <div className="admin-page">
      <AdminHeader />
      <div className="admin-page__body">
        <p className="event-form__breadcrumb">EVENTOS &gt; {(event?.title ?? 'EVENTO').toUpperCase()} &gt; RESERVAS</p>
        <h1 className="event-form__title">Reservas — {event?.title ?? 'Evento'}</h1>
        <p className="event-form__subtitle">
          La gestión de comprobantes y aprobación de reservas se construirá en el próximo módulo.
        </p>
        <Link to="/admin/eventos" className="admin-link">
          ← Volver a Gestión de Eventos
        </Link>
      </div>
    </div>
  )
}
