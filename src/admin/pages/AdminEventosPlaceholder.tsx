import AdminBrand from '../components/AdminBrand'
import { useAdminAuth } from '../AdminAuthContext'
import './AdminEventosPlaceholder.css'

// Stands in for the real events-management module (next milestone). It only
// exists so /admin/eventos has something to protect and to prove sign-out
// works from inside the authenticated area.
export default function AdminEventosPlaceholder() {
  const { session, signOut } = useAdminAuth()

  return (
    <div className="admin-placeholder">
      <header className="admin-placeholder__header">
        <AdminBrand />
        <button type="button" className="btn btn--secondary admin-placeholder__signout" onClick={signOut}>
          Cerrar sesión
        </button>
      </header>

      <main className="admin-placeholder__body">
        <h1>Panel de Eventos</h1>
        <p>
          Sesión iniciada como <strong>{session?.email}</strong>. El listado y la gestión de eventos se
          construirán en el próximo módulo.
        </p>
      </main>
    </div>
  )
}
