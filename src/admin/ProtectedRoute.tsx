import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, initializing } = useAdminAuth()
  const location = useLocation()

  // Avoid a flash-redirect to /admin/login while the persisted session is
  // still being read on first mount.
  if (initializing) return null

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
