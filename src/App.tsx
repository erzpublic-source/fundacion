import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home/Home'
import Historias from './pages/Historias/Historias'
import Donar from './pages/Donar/Donar'
import Voluntariado from './pages/Voluntariado/Voluntariado'
import Eventos from './pages/Eventos/Eventos'
import Contacto from './pages/Contacto/Contacto'
import { AdminAuthProvider } from './admin/AdminAuthContext'
import { AdminEventsProvider } from './admin/AdminEventsContext'
import ProtectedRoute from './admin/ProtectedRoute'
import AdminLogin from './admin/pages/Login'
import AdminRecuperarContrasena from './admin/pages/RecuperarContrasena'
import AdminEnlaceEnviado from './admin/pages/EnlaceEnviado'
import AdminNuevaContrasena from './admin/pages/NuevaContrasena'
import GestionEventos from './admin/pages/GestionEventos'
import EventForm from './admin/pages/EventForm'
import EventoReservasStub from './admin/pages/EventoReservasStub'

// Client-side route changes don't reset scroll position by default, and on a
// full page load the browser tries to scroll to the URL's #hash before React
// has rendered the target element, so that native scroll silently misses.
function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
      return
    }
    // Bypass the global `scroll-behavior: smooth` so a page navigation lands
    // instantly at the top instead of visibly animating the scroll away.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}

// Remounting this wrapper on every pathname change restarts its CSS fade-in
// animation, so each page eases in instead of popping in instantly. It must
// stay BELOW the admin providers in the tree (see App below) — keying a
// wrapper that sits above stateful context providers would remount them,
// and with them wipe out the mock session/events store, on every navigation.
function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="page-fade">
      {children}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {/* Mounted once for the whole app lifetime — never inside PageTransition's
          remounting boundary — so the mock session and events store survive
          client-side navigation instead of resetting on every route change. */}
      <AdminAuthProvider>
        <AdminEventsProvider>
          <ScrollToTop />
          <PageTransition>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/historias" element={<Historias />} />
              <Route path="/donar" element={<Donar />} />
              <Route path="/voluntariado" element={<Voluntariado />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/contacto" element={<Contacto />} />

              <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/recuperar-contrasena" element={<AdminRecuperarContrasena />} />
              <Route path="/admin/enlace-enviado" element={<AdminEnlaceEnviado />} />
              <Route path="/admin/nueva-contrasena" element={<AdminNuevaContrasena />} />

              <Route
                path="/admin/eventos"
                element={
                  <ProtectedRoute>
                    <GestionEventos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/eventos/nuevo"
                element={
                  <ProtectedRoute>
                    <EventForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/eventos/:id/editar"
                element={
                  <ProtectedRoute>
                    <EventForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/eventos/:id/reservas"
                element={
                  <ProtectedRoute>
                    <EventoReservasStub />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Home />} />
            </Routes>
          </PageTransition>
        </AdminEventsProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}

export default App
