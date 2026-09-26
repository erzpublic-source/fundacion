import { Link, useLocation } from 'react-router-dom'
import AdminBrand from './AdminBrand'
import { useAdminAuth } from '../AdminAuthContext'
import './AdminSidebar.css'

function CalendarNavIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" strokeLinecap="round" />
    </svg>
  )
}

function PlusNavIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

function GearNavIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" />
      <path
        d="M12 3.5v2M12 18.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3.5 12h2M18.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M6 14H3.5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1H6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 11 14 8l-3.5-3M14 8H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
    </svg>
  )
}

const NAV_ITEMS = [
  { to: '/admin/eventos', label: 'Eventos', icon: CalendarNavIcon, exact: false },
  { to: '/admin/eventos/nuevo', label: 'Crear evento', icon: PlusNavIcon, exact: true },
  { to: '/admin/configuracion', label: 'Configuración', icon: GearNavIcon, exact: true },
]

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

// Persistent left navigation, replacing the previous single horizontal
// AdminHeader bar. On mobile it becomes an off-canvas drawer (no mobile
// mockup was supplied for this screen, so this behavior is our own call).
export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { signOut } = useAdminAuth()
  const location = useLocation()

  function isActive(to: string, exact: boolean) {
    return exact ? location.pathname === to : location.pathname.startsWith(to) && location.pathname !== '/admin/eventos/nuevo'
  }

  return (
    <>
      {open && <div className="admin-sidebar__backdrop" role="presentation" onClick={onClose} />}
      <aside className={`admin-sidebar${open ? ' admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__top">
          <Link to="/admin/eventos" className="admin-sidebar__brand">
            <AdminBrand />
          </Link>
          <button type="button" className="admin-sidebar__close" onClick={onClose} aria-label="Cerrar menú">
            <CloseIcon />
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              className={`admin-sidebar__link${isActive(to, exact) ? ' admin-sidebar__link--active' : ''}`}
              onClick={onClose}
            >
              <Icon />
              {label}
            </Link>
          ))}
        </nav>

        <button type="button" className="admin-sidebar__signout" onClick={signOut}>
          <LogoutIcon />
          Cerrar sesión
        </button>
      </aside>
    </>
  )
}
