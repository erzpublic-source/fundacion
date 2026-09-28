import { Link } from 'react-router-dom'

function ArrowLeftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M13 8H3M7 4 3 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface BackLinkProps {
  to: string
  label: string
}

// Shared "back" affordance for the deeper admin screens (Editar evento,
// Ver reservas) — every screen one level below the events list gets the
// same escape hatch instead of relying on the sidebar or browser back.
export default function BackLink({ to, label }: BackLinkProps) {
  return (
    <Link to={to} className="admin-back-link">
      <ArrowLeftIcon />
      {label}
    </Link>
  )
}
