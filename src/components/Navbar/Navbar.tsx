import { useEffect, useState } from 'react'
import Logo from './Logo'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Inicio', href: '#inicio', active: true },
  { label: 'Historias', href: '#historias' },
  { label: 'Eventos', href: '#eventos' },
  { label: 'Donar', href: '#donar' },
  { label: 'Voluntariado', href: '#voluntariado' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar${isScrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__bar">
        <a href="#inicio" className="navbar__logo" aria-label="Fundación Un Día Más — Inicio">
          <Logo />
        </a>

        <span className="navbar__divider" aria-hidden="true" />

        <nav className="navbar__nav" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`navbar__pill${link.active ? ' navbar__pill--active' : ''}`}
            >
              {link.active && <span className="navbar__dot" aria-hidden="true" />}
              {link.label}
            </a>
          ))}
        </nav>

        <a href="#sos" className="navbar__sos">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M0,20V2C0,1.45.2.98.59.59c.39-.39.86-.59,1.41-.59h16c.55,0,1.02.2,1.41.59.39.39.59.86.59,1.41v12c0,.55-.2,1.02-.59,1.41-.39.39-.86.59-1.41.59H4L0,20ZM4,12h8v-2H4v2ZM4,9h12v-2H4v2ZM4,6h12v-2H4v2Z" />
          </svg>
          SOS Te escucho
        </a>
      </div>
    </header>
  )
}
