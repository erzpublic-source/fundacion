import { Link } from 'react-router-dom'
import AdminBrand from './AdminBrand'
import { useAdminAuth } from '../AdminAuthContext'
import './AdminHeader.css'

// Mock display profile keyed by the mock session email — stands in for a
// real `profiles` table row until Supabase is wired up.
const MOCK_PROFILES: Record<string, { name: string; role: string }> = {
  'admin@undiamas.org': { name: 'Anna Gómez', role: 'Directora Operativa' },
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M6 14H3.5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1H6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 11 14 8l-3.5-3M14 8H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AdminHeader() {
  const { session, signOut } = useAdminAuth()
  const profile = (session && MOCK_PROFILES[session.email.toLowerCase()]) || { name: session?.email ?? '', role: 'Administrador' }
  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="admin-header">
      <Link to="/admin/eventos" className="admin-header__brand">
        <AdminBrand />
      </Link>

      <div className="admin-header__user">
        <span className="admin-header__avatar" aria-hidden="true">
          {initials}
        </span>
        <span className="admin-header__identity">
          <span className="admin-header__name">{profile.name}</span>
          <span className="admin-header__role">{profile.role}</span>
        </span>
        <button type="button" className="btn btn--secondary admin-header__signout" onClick={signOut}>
          <LogoutIcon />
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
