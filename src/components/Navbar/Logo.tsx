interface LogoProps {
  className?: string
}

export default function Logo({ className }: LogoProps) {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#6a5390" />
            <stop offset="1" stopColor="#d4679a" />
          </linearGradient>
        </defs>
        <circle cx="14" cy="14" r="14" fill="url(#logo-gradient)" />
        <path
          d="M14 20.5s-6-3.7-6-8.2A3.8 3.8 0 0 1 14 9.7a3.8 3.8 0 0 1 6 2.6c0 4.5-6 8.2-6 8.2Z"
          fill="#fff"
        />
      </svg>
      <span
        className="logo__text"
        style={{
          fontFamily: 'var(--font-family)',
          fontWeight: 700,
          fontSize: 16,
          whiteSpace: 'nowrap',
        }}
      >
        Fundación Un Día Más
      </span>
    </span>
  )
}
