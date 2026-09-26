import { useState } from 'react'
import type { ReactNode } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import './AdminLayout.css'

interface AdminLayoutProps {
  children: ReactNode
}

// Shared shell for every protected admin screen: persistent sidebar (drawer
// on mobile) + top bar + content area. Replaces the previous per-page
// `.admin-page` + standalone <AdminHeader/> pattern.
export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-layout">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-layout__main">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <div className="admin-layout__body">{children}</div>
      </div>
    </div>
  )
}
