import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AdminBrand from './AdminBrand'
import './AdminAuthLayout.css'

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M14 8H2M7 3 2 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface AdminAuthLayoutProps {
  subtitle: string
  backLink?: { label: string; to: string }
  children: ReactNode
}

export default function AdminAuthLayout({ subtitle, backLink, children }: AdminAuthLayoutProps) {
  return (
    <div className="admin-auth">
      <span className="admin-auth__blob admin-auth__blob--a" aria-hidden="true" />
      <span className="admin-auth__blob admin-auth__blob--b" aria-hidden="true" />

      <div className="admin-auth__inner">
        {backLink && (
          <Link to={backLink.to} className="admin-auth__back">
            <ArrowLeftIcon />
            {backLink.label}
          </Link>
        )}

        <AdminBrand />
        <p className="admin-auth__subtitle">{subtitle}</p>

        <div className="admin-auth__card">{children}</div>
      </div>
    </div>
  )
}
