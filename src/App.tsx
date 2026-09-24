import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home/Home'
import Historias from './pages/Historias/Historias'
import Donar from './pages/Donar/Donar'
import Voluntariado from './pages/Voluntariado/Voluntariado'
import Eventos from './pages/Eventos/Eventos'
import Contacto from './pages/Contacto/Contacto'

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
// animation, so each page eases in instead of popping in instantly.
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
      <ScrollToTop />
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/historias" element={<Historias />} />
          <Route path="/donar" element={<Donar />} />
          <Route path="/voluntariado" element={<Voluntariado />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </PageTransition>
    </BrowserRouter>
  )
}

export default App
