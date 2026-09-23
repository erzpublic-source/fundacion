import { useEffect, useState } from 'react'

const BAR_COUNT = 6
const MIN_VISIBLE_MS = 450
const FALLBACK_TIMEOUT_MS = 2500
const BAR_TRANSITION_MS = 650
const BAR_STAGGER_MS = 70
// Total time for every staggered bar to finish rising, plus a small buffer.
const REVEAL_DURATION_MS = BAR_TRANSITION_MS + BAR_STAGGER_MS * (BAR_COUNT - 1) + 50

// Plays once per browser session (not on every SPA return to "/"), reset on
// a full page reload.
let hasPlayed = false

interface HeroPreloaderProps {
  imageSrc: string
}

export default function HeroPreloader({ imageSrc }: HeroPreloaderProps) {
  const [revealing, setRevealing] = useState(false)
  const [mounted, setMounted] = useState(!hasPlayed)

  useEffect(() => {
    if (hasPlayed) return
    hasPlayed = true

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMounted(false)
      return
    }

    const startedAt = Date.now()
    let settled = false

    const reveal = () => {
      if (settled) return
      settled = true
      const elapsed = Date.now() - startedAt
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed)
      window.setTimeout(() => {
        setRevealing(true)
        window.setTimeout(() => setMounted(false), REVEAL_DURATION_MS)
      }, wait)
    }

    const img = new Image()
    img.onload = reveal
    img.onerror = reveal
    img.src = imageSrc
    if (img.complete) reveal()

    const fallback = window.setTimeout(reveal, FALLBACK_TIMEOUT_MS)
    return () => window.clearTimeout(fallback)
  }, [imageSrc])

  if (!mounted) return null

  return (
    <div className={`hero-preloader${revealing ? ' hero-preloader--reveal' : ''}`} aria-hidden="true">
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <span key={i} className="hero-preloader__bar" style={{ backgroundPosition: `${(i * 100) / (BAR_COUNT - 1)}% 0` }} />
      ))}
    </div>
  )
}
