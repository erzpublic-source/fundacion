import { useAdminAuth } from '../AdminAuthContext'
import './AdminHeader.css'

// Mock display profile keyed by the mock session email — stands in for a
// real `profiles` table row until Supabase is wired up.
const MOCK_PROFILES: Record<string, { name: string; role: string }> = {
  'admin@undiamas.org': { name: 'Diana Cuevas', role: 'Directora Operativa' },
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M2 4.5h12M2 8h12M2 11.5h12" strokeLinecap="round" />
    </svg>
  )
}

interface AdminHeaderProps {
  onMenuClick?: () => void
}

// Lightweight top bar used inside AdminLayout: just the mobile menu toggle
// plus the signed-in admin's avatar/name/role. Brand and logout now live in
// AdminSidebar instead of here.
export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { session } = useAdminAuth()
  const profile = (session && MOCK_PROFILES[session.email.toLowerCase()]) || { name: session?.email ?? '', role: 'Administrador' }
  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="admin-header">
      <button type="button" className="admin-header__menu" onClick={onMenuClick} aria-label="Abrir menú">
        <MenuIcon />
      </button>

      <div className="admin-header__user">
        <span className="admin-header__avatar" aria-hidden="true">
          {initials}
        </span>
        <span className="admin-header__identity">
          <span className="admin-header__name">{profile.name}</span>
          <span className="admin-header__role">{profile.role}</span>
        </span>
      </div>
    </header>
  )
}
