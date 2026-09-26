import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import Logo from './Logo'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Historias', href: '/historias' },
  { label: 'Eventos', href: '/eventos' },
  { label: 'Donar', href: '/donar' },
  { label: 'Voluntariado', href: '/voluntariado' },
  { label: 'Contacto', href: '/contacto' },
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
    <svg width="20" height="20" viewBox="0 0 29 29" fill="none" aria-hidden="true">
      <rect width="29" height="29" rx="14.5" fill="#43B581" />
      <path
        d="M7.81336 18.6318C7.87769 18.3395 7.85314 18.0346 7.74285 17.7564C6.97537 16.164 6.79497 14.3517 7.23348 12.6393C7.67199 10.9269 8.70124 9.42431 10.1396 8.39677C11.578 7.36922 13.3331 6.88272 15.0952 7.02308C16.8573 7.16345 18.5133 7.92167 19.7708 9.16396C21.0284 10.4063 21.8068 12.0528 21.9687 13.8131C22.1306 15.5733 21.6655 17.3342 20.6556 18.785C19.6457 20.2359 18.1559 21.2834 16.4489 21.7428C14.7419 22.2022 12.9275 22.0439 11.3259 21.2959C11.063 21.1961 10.7774 21.1722 10.5016 21.2269L7.94162 21.9755C7.81813 22.0083 7.68831 22.009 7.56449 21.9775C7.44066 21.946 7.32692 21.8834 7.23406 21.7957C7.1412 21.7079 7.07229 21.5979 7.03388 21.4761C6.99546 21.3542 6.9888 21.2246 7.01454 21.0994L7.81336 18.6318Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden="true">
      <rect x="7" y="1" width="14" height="2" rx="1" fill="currentColor" />
      <rect x="4" y="6" width="14" height="2" rx="1" fill="currentColor" />
      <rect x="1" y="11" width="14" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}

function CloseXIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 9.5 10 3l7 6.5V16a1 1 0 0 1-1 1h-3.5v-5h-5v5H4a1 1 0 0 1-1-1V9.5Z" strokeLinejoin="round" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M10 5.2c-1.1-.9-2.7-1.4-4.5-1.4-1 0-1.9.15-2.5.35v10.4c.6-.2 1.5-.35 2.5-.35 1.8 0 3.4.5 4.5 1.4M10 5.2c1.1-.9 2.7-1.4 4.5-1.4 1 0 1.9.15 2.5.35v10.4c-.6-.2-1.5-.35-2.5-.35-1.8 0-3.4.5-4.5 1.4M10 5.2v10.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarNavIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="2" />
      <path d="M2 6.5h12M5 1.5v2M11 1.5v2" strokeLinecap="round" />
    </svg>
  )
}

function HeartNavIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M8 14s-5.5-3.36-5.5-7.2C2.5 4.62 4.12 3 6.1 3c1.14 0 2.22.56 2.9 1.44C9.68 3.56 10.76 3 11.9 3c1.98 0 3.6 1.62 3.6 3.8C15.5 10.64 8 14 8 14Z" strokeLinejoin="round" />
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="7.5" cy="6.5" r="2.5" />
      <circle cx="14" cy="7.5" r="2" />
      <path d="M2.5 17c.5-3 2.5-4.8 5-4.8s4.5 1.8 5 4.8" strokeLinecap="round" />
      <path d="M13 12.6c2 .1 3.5 1.7 4 4.4" strokeLinecap="round" />
    </svg>
  )
}

function MailNavIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" />
      <path d="M2 4l6 4.5L14 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const NAV_ICONS: Record<string, ReactNode> = {
  '/': <HomeIcon />,
  '/historias': <BookIcon />,
  '/eventos': <CalendarNavIcon />,
  '/donar': <HeartNavIcon />,
  '/voluntariado': <PeopleIcon />,
  '/contacto': <MailNavIcon />,
}

export default function Navbar() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrollSpyId, setScrollSpyId] = useState('inicio')

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

  // The overlay is a full-screen opaque panel with its own internal scroll,
  // so the page behind it must not scroll while it's open.
  useEffect(() => {
    if (!menuOpen) return
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
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
            <ChevronIcon />
          </a>
        </div>
      </header>

      <header className="mobile-topbar">
        <Link to="/" className="mobile-topbar__logo" aria-label="Fundación Un Día Más — Inicio">
          <Logo />
        </Link>

        <a href="#sos" className="navbar__sos">
          <SosIcon />
          SOS Te escucho
          <ChevronIcon />
        </a>
      </header>

      <div className={`mobile-menu-overlay${menuOpen ? ' mobile-menu-overlay--open' : ''}`}>
        <div className="mobile-menu-overlay__header">
          <Link to="/" className="mobile-topbar__logo" aria-label="Fundación Un Día Más — Inicio" onClick={closeMenu}>
            <Logo />
          </Link>

          <button type="button" className="mobile-menu-overlay__close" onClick={closeMenu} aria-label="Cerrar menú">
            <CloseXIcon />
          </button>
        </div>

        <p className="mobile-menu-overlay__label">Navegación principal</p>

        <nav className="mobile-menu-overlay__list" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <NavAnchor
              key={link.label}
              href={link.href}
              onClick={closeMenu}
              className={`mobile-menu-overlay__item${link.href === activeHref ? ' mobile-menu-overlay__item--active' : ''}`}
            >
              {NAV_ICONS[link.href]}
              <span className="mobile-menu-overlay__item-label">{link.label}</span>
              {link.href === activeHref && <span className="navbar__dot" aria-hidden="true" />}
            </NavAnchor>
          ))}
        </nav>

        <blockquote className="mobile-menu-overlay__quote">
          "Antes de decorar, el sistema debe orientar. Antes de impresionar, debe hacer sentir a cada persona vista,
          segura y acompañada."
        </blockquote>
      </div>

      <nav className="mobile-bottombar" aria-label="Navegación rápida">
        {NAV_LINKS.slice(0, 3).map((link) => (
          <NavAnchor
            key={link.label}
            href={link.href}
            onClick={closeMenu}
            className={`mobile-bottombar__item${link.href === activeHref ? ' mobile-bottombar__item--active' : ''}`}
          >
            <span className="mobile-bottombar__icon" aria-hidden="true">
              {NAV_ICONS[link.href]}
            </span>
            <span>{link.label}</span>
          </NavAnchor>
        ))}

        <button
          type="button"
          className="mobile-bottombar__item"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label="Abrir menú de navegación"
        >
          <span className="mobile-bottombar__icon" aria-hidden="true">
            <MenuIcon />
          </span>
          <span>Menú</span>
        </button>
      </nav>
    </>
  )
}
