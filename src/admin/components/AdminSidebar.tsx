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
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M7.25275 3.1026C7.29407 2.66786 7.496 2.26414 7.81907 1.97031C8.14215 1.67649 8.56317 1.51367 8.99987 1.51367C9.43658 1.51367 9.85759 1.67649 10.1807 1.97031C10.5037 2.26414 10.7057 2.66786 10.747 3.1026C10.7718 3.38344 10.864 3.65417 11.0156 3.89186C11.1672 4.12955 11.3739 4.32721 11.6181 4.46811C11.8623 4.60901 12.1369 4.689 12.4185 4.70132C12.7002 4.71363 12.9807 4.6579 13.2362 4.53885C13.6331 4.35869 14.0828 4.33262 14.4977 4.46572C14.9127 4.59882 15.2634 4.88156 15.4814 5.25893C15.6994 5.6363 15.7692 6.08128 15.6772 6.50728C15.5852 6.93328 15.338 7.30981 14.9837 7.5636C14.753 7.72549 14.5647 7.94056 14.4347 8.19062C14.3047 8.44068 14.2368 8.71838 14.2368 9.00023C14.2368 9.28207 14.3047 9.55977 14.4347 9.80983C14.5647 10.0599 14.753 10.275 14.9837 10.4369C15.338 10.6906 15.5852 11.0672 15.6772 11.4932C15.7692 11.9192 15.6994 12.3642 15.4814 12.7415C15.2634 13.1189 14.9127 13.4016 14.4977 13.5347C14.0828 13.6678 13.6331 13.6418 13.2362 13.4616C12.9807 13.3426 12.7002 13.2868 12.4185 13.2991C12.1369 13.3114 11.8623 13.3914 11.6181 13.5323C11.3739 13.6732 11.1672 13.8709 11.0156 14.1086C10.864 14.3463 10.7718 14.617 10.747 14.8979C10.7057 15.3326 10.5037 15.7363 10.1807 16.0301C9.85759 16.324 9.43658 16.4868 8.99987 16.4868C8.56317 16.4868 8.14215 16.324 7.81907 16.0301C7.496 15.7363 7.29407 15.3326 7.25275 14.8979C7.22795 14.6169 7.13582 14.3461 6.98415 14.1083C6.83247 13.8705 6.62573 13.6728 6.38142 13.5319C6.13712 13.391 5.86245 13.311 5.58068 13.2988C5.29891 13.2865 5.01835 13.3424 4.76275 13.4616C4.36591 13.6418 3.91624 13.6678 3.50125 13.5347C3.08625 13.4016 2.73563 13.1189 2.51761 12.7415C2.29959 12.3642 2.22978 11.9192 2.32177 11.4932C2.41375 11.0672 2.66095 10.6906 3.01525 10.4369C3.24596 10.275 3.43429 10.0599 3.56431 9.80983C3.69433 9.55977 3.76221 9.28207 3.76221 9.00023C3.76221 8.71838 3.69433 8.44068 3.56431 8.19062C3.43429 7.94056 3.24596 7.72549 3.01525 7.5636C2.66144 7.30969 2.41468 6.9333 2.32292 6.50759C2.23116 6.08188 2.30095 5.63726 2.51873 5.26014C2.73652 4.88302 3.08673 4.60034 3.50131 4.46703C3.9159 4.33373 4.36523 4.35933 4.762 4.53885C5.01756 4.6579 5.29805 4.71363 5.57972 4.70132C5.86139 4.689 6.13595 4.60901 6.38015 4.46811C6.62435 4.32721 6.83102 4.12955 6.98265 3.89186C7.13428 3.65417 7.22641 3.38344 7.25125 3.1026M11.2493 9.00049C11.2493 10.2431 10.2419 11.2505 8.99927 11.2505C7.75663 11.2505 6.74927 10.2431 6.74927 9.00049C6.74927 7.75785 7.75663 6.75049 8.99927 6.75049C10.2419 6.75049 11.2493 7.75785 11.2493 9.00049Z"
        stroke="currentColor"
        strokeWidth="2"
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
