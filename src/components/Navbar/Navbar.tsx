import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import Logo from './Logo'
import { homeAnchor } from '../../utils/links'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Historias', href: '/historias' },
  { label: 'Eventos', href: homeAnchor('eventos') },
  { label: 'Donar', href: '/donar' },
  { label: 'Voluntariado', href: homeAnchor('voluntariado') },
  { label: 'Contacto', href: homeAnchor('contacto') },
]

function getAnchorId(href: string): string | null {
  const hashIndex = href.indexOf('#')
  return hashIndex === -1 ? null : href.slice(hashIndex + 1)
}

interface NavAnchorProps {
  href: string
  className: string
  onClick?: () => void
  children: ReactNode
}

// Plain page routes (no `#`) navigate client-side via React Router; hash
// links stay as real anchors so the browser's native hash-scroll works even
// when the target lives on a different page (e.g. from Historias to "/#donar").
function NavAnchor({ href, className, onClick, children }: NavAnchorProps) {
  if (href.includes('#')) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <Link to={href} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

function SosIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M0,20V2C0,1.45.2.98.59.59c.39-.39.86-.59,1.41-.59h16c.55,0,1.02.2,1.41.59.39.39.59.86.59,1.41v12c0,.55-.2,1.02-.59,1.41-.39.39-.86.59-1.41.59H4L0,20ZM4,12h8v-2H4v2ZM4,9h12v-2H4v2ZM4,6h12v-2H4v2Z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden="true">
      <rect className="menu-icon__line menu-icon__line--top" x="7" y="1" width="14" height="2" rx="1" fill="currentColor" />
      <rect className="menu-icon__line menu-icon__line--mid" x="4" y="6" width="14" height="2" rx="1" fill="currentColor" />
      <rect className="menu-icon__line menu-icon__line--bottom" x="1" y="11" width="14" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}

export default function Navbar() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrollSpyId, setScrollSpyId] = useState('inicio')
  const bottombarRef = useRef<HTMLDivElement>(null)
  const menuPanelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!isHome) return

    const targets = NAV_LINKS.map((link) => getAnchorId(link.href))
      .filter((id): id is string => id !== null)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) {
          setScrollSpyId(visible.target.id)
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [isHome])

  const activeHref = isHome
    ? (NAV_LINKS.find((link) => getAnchorId(link.href) === scrollSpyId)?.href ?? '/')
    : location.pathname

  useEffect(() => {
    if (!menuOpen) return
    const closeOnScroll = () => setMenuOpen(false)
    window.addEventListener('scroll', closeOnScroll, { passive: true })
    return () => window.removeEventListener('scroll', closeOnScroll)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const elements = [bottombarRef.current, menuPanelRef.current].filter(
      (el): el is HTMLElement => el !== null,
    )
    if (elements.length === 0) return
    // Scrolling/swiping/wheeling over the menu itself must not bubble into
    // a page scroll (which would otherwise trigger closeOnScroll above).
    const stop = (event: Event) => {
      event.preventDefault()
      event.stopPropagation()
    }
    elements.forEach((el) => {
      el.addEventListener('wheel', stop, { passive: false })
      el.addEventListener('touchmove', stop, { passive: false })
    })
    return () => {
      elements.forEach((el) => {
        el.removeEventListener('wheel', stop)
        el.removeEventListener('touchmove', stop)
      })
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header className={`navbar${isScrolled ? ' navbar--scrolled' : ''}`}>
        <div className="navbar__bar">
          <Link to="/" className="navbar__logo" aria-label="Fundación Un Día Más — Inicio">
            <Logo />
          </Link>

          <span className="navbar__divider" aria-hidden="true" />

          <nav className="navbar__nav" aria-label="Navegación principal">
            {NAV_LINKS.map((link) => (
              <NavAnchor
                key={link.label}
                href={link.href}
                className={`navbar__pill${link.href === activeHref ? ' navbar__pill--active' : ''}`}
              >
                {link.href === activeHref && <span className="navbar__dot" aria-hidden="true" />}
                {link.label}
              </NavAnchor>
            ))}
          </nav>

          <a href="#sos" className="navbar__sos">
            <SosIcon />
            SOS Te escucho
          </a>
        </div>
      </header>

      <header className="mobile-topbar">
        <Link to="/" className="mobile-topbar__logo" aria-label="Fundación Un Día Más — Inicio">
          <Logo />
        </Link>
      </header>

      <div
        className={`mobile-menu-backdrop${menuOpen ? ' mobile-menu-backdrop--visible' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <nav
        ref={menuPanelRef}
        className={`mobile-menu-panel${menuOpen ? ' mobile-menu-panel--open' : ''}`}
        aria-label="Navegación principal"
      >
        {NAV_LINKS.map((link) => (
          <NavAnchor
            key={link.label}
            href={link.href}
            onClick={closeMenu}
            className={`mobile-menu-panel__pill${link.href === activeHref ? ' mobile-menu-panel__pill--active' : ''}`}
          >
            {link.href === activeHref && <span className="navbar__dot" aria-hidden="true" />}
            {link.label}
          </NavAnchor>
        ))}
      </nav>

      <div ref={bottombarRef} className="mobile-bottombar">
        <div className="mobile-bottombar__row">
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="Abrir menú de navegación"
          >
            <MenuIcon />
            Menú
          </button>

          <a href="#sos" className="navbar__sos">
            <SosIcon />
            SOS Te escucho
          </a>
        </div>
      </div>
    </>
  )
}
