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
  return (
    <header className="navbar">
      <div className="navbar__top">
        <a href="#inicio" className="navbar__logo" aria-label="Fundación Un Día Más — Inicio">
          <Logo />
        </a>
        <a href="#sos" className="navbar__sos">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M9 16.5s-6.5-4-6.5-8.7A3.8 3.8 0 0 1 9 5.2a3.8 3.8 0 0 1 6.5 2.6c0 4.7-6.5 8.7-6.5 8.7Z"
              stroke="#43b581"
              strokeWidth="1.4"
            />
          </svg>
          SOS Te escucho
        </a>
      </div>
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
    </header>
  )
}
