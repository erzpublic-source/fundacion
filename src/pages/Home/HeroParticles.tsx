import { useEffect, useRef } from 'react'

// Brand palette (amarillo-impulso, rosa-empatía, lavanda-comunidad, azul-confianza)
const ORB_COLORS = ['rgba(243, 211, 114, ', 'rgba(212, 103, 154, ', 'rgba(153, 129, 193, ', 'rgba(41, 97, 151, ']

interface Orb {
  x: number
  y: number
  radius: number
  speedX: number
  speedY: number
  colorBase: string
  opacity: number
  pulse: number
  pulseSpeed: number
  currentOpacity: number
}

function createOrb(width: number, height: number, isInitial: boolean): Orb {
  return {
    x: Math.random() * width,
    y: isInitial ? Math.random() * height : height + Math.random() * 40,
    radius: Math.random() * 5 + 3,
    speedY: Math.random() * 0.45 + 0.15,
    speedX: (Math.random() - 0.5) * 0.3,
    colorBase: ORB_COLORS[Math.floor(Math.random() * ORB_COLORS.length)],
    opacity: Math.random() * 0.5 + 0.25,
    pulseSpeed: Math.random() * 0.02 + 0.01,
    pulse: Math.random() * Math.PI * 2,
    currentOpacity: 0,
  }
}

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !container || !ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let width = container.clientWidth
    let height = container.clientHeight
    canvas.width = width
    canvas.height = height

    const orbCount = Math.max(12, Math.floor(Math.min(width, 1400) / 28))
    const orbs: Orb[] = Array.from({ length: orbCount }, () => createOrb(width, height, true))

    const drawConstellationLines = () => {
      const maxDist = 135
      for (let i = 0; i < orbs.length; i++) {
        for (let j = i + 1; j < orbs.length; j++) {
          const dx = orbs[i].x - orbs[j].x
          const dy = orbs[i].y - orbs[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.12
            ctx.beginPath()
            ctx.setLineDash([4, 6])
            ctx.strokeStyle = `rgba(153, 129, 193, ${lineAlpha})`
            ctx.lineWidth = 0.8
            ctx.moveTo(orbs[i].x, orbs[i].y)
            ctx.lineTo(orbs[j].x, orbs[j].y)
            ctx.stroke()
            ctx.setLineDash([])
          }
        }
      }
    }

    const updateOrb = (orb: Orb) => {
      orb.y -= orb.speedY
      orb.x += Math.sin(orb.pulse) * 0.35 + orb.speedX
      orb.pulse += orb.pulseSpeed
      orb.currentOpacity = orb.opacity * (0.65 + 0.35 * Math.sin(orb.pulse))
      if (orb.y < -30 || orb.x < -30 || orb.x > width + 30) {
        Object.assign(orb, createOrb(width, height, false))
      }
    }

    const drawOrb = (orb: Orb) => {
      ctx.save()
      ctx.beginPath()
      ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
      const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius * 2.2)
      gradient.addColorStop(0, orb.colorBase + orb.currentOpacity + ')')
      gradient.addColorStop(0.4, orb.colorBase + orb.currentOpacity * 0.6 + ')')
      gradient.addColorStop(1, orb.colorBase + '0)')
      ctx.fillStyle = gradient
      ctx.fill()
      if (orb.radius > 5) {
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${orb.currentOpacity * 0.8})`
        ctx.fill()
      }
      ctx.restore()
    }

    let frameId = 0
    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      drawConstellationLines()
      orbs.forEach((orb) => {
        updateOrb(orb)
        drawOrb(orb)
      })
      frameId = requestAnimationFrame(animate)
    }
    animate()

    const resizeObserver = new ResizeObserver(() => {
      width = container.clientWidth
      height = container.clientHeight
      canvas.width = width
      canvas.height = height
    })
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
    }
  }, [])

  return <canvas className="hero__particles" ref={canvasRef} aria-hidden="true" />
}
