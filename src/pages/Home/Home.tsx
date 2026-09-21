import { useEffect, useRef } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import heroImage from '../../assets/images/hero.jpg'
import impactoHistorias from '../../assets/images/impacto-historias.jpg'
import impactoEventos from '../../assets/images/impacto-eventos.jpg'
import impactoVoluntariado from '../../assets/images/impacto-voluntariado.jpg'
import './Home.css'

const ESENCIA = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#67518d" strokeWidth="1.7">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
      </svg>
    ),
    iconBg: '#ede8f4',
    title: 'Quiénes somos',
    text: (
      <>
        En la <strong>Fundación Un Día Más</strong> creemos que la salud mental es un derecho fundamental.
        Somos un equipo interdisciplinario que trabaja incansablemente para brindar herramientas de sanación
        y acompañamiento a quienes atraviesan momentos de oscuridad, recordándoles que siempre puede existir
        un día más para volver a empezar.
      </>
    ),
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c99a2e" strokeWidth="1.7">
        <path
          d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.5l-5.8 3 1.1-6.5-4.7-4.6 6.5-.9L12 2.5Z"
          strokeLinejoin="round"
        />
      </svg>
    ),
    iconBg: '#fdf8e8',
    title: 'Misión',
    text: (
      <>
        En la <strong>Fundación Un Día Más</strong> transformamos la manera de comprender el bienestar
        emocional. Nuestra misión es prevenir el aislamiento a través del arte, la música y la escucha
        activa, construyendo puentes de esperanza que permitan a cada individuo encontrar un camino para
        vivir un día más. Porque toda persona merece ser escuchada, acompañada y encontrar{' '}
        <strong>un camino para vivir un día más.</strong>
      </>
    ),
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#296197" strokeWidth="1.7">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    iconBg: '#e9f1fa',
    title: 'Visión',
    text: (
      <>
        Para 2035, la <strong>Fundación Un Día Más</strong> será un referente regional en el acompañamiento
        emocional alternativo, consolidando una red de apoyo donde ninguna persona tenga que enfrentar en
        silencio una crisis emocional. A través de programas de alto impacto, investigación, tecnología y
        alianzas estratégicas, reduciremos las brechas de acceso y contribuiremos a construir una sociedad
        donde pedir ayuda sea un acto de valentía.
      </>
    ),
  },
]

const IMPACTO = [
  {
    tag: 'Historias',
    tagColor: 'rgba(153,129,193,0.85)',
    title: 'Historias que merecen ser escuchadas',
    text: 'Conoce testimonios reales de resiliencia y esperanza.',
    link: 'Ver historias',
    href: '#historias',
    image: impactoHistorias,
  },
  {
    tag: 'Eventos',
    tagColor: 'rgba(101,152,209,0.85)',
    title: 'Encuentros y comunidad',
    text: 'Participa en nuestros encuentros y actividades comunitarias.',
    link: 'Ver eventos',
    href: '#eventos',
    image: impactoEventos,
  },
  {
    tag: 'Voluntariado',
    tagColor: 'rgba(232,201,64,0.85)',
    tagText: '#331a4d',
    title: 'Sé parte del cambio',
    text: 'Únete a nuestro equipo y sé parte del cambio.',
    link: 'Ver voluntariado',
    href: '#voluntariado',
    image: impactoVoluntariado,
  },
]

const SPONSORS = ['LOGO_1', 'LOGO_2', 'LOGO_3', 'LOGO_4', 'LOGO_5']

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M2 8h12M9 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Home() {
  const heroParallaxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 900px)')
    if (!mediaQuery.matches) return

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const el = heroParallaxRef.current
        if (el) {
          const offset = Math.min(window.scrollY * 0.15, 120)
          el.style.backgroundPosition = `5% calc(22% + ${offset}px)`
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Navbar />

      <main>
        <section className="hero" id="inicio">
          <div className="hero__inner">
            <div
              className="hero__media"
              role="img"
              aria-label="Mujer sonriendo en un ambiente cálido, acompañada en una conversación"
              ref={heroParallaxRef}
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            <div className="hero__content">
              <h1 className="hero__title">
                Un espacio seguro para
                <br />
                <strong>volver a brillar</strong>
              </h1>

              <div className="hero__ctas">
                <a href="#nosotros" className="btn btn--primary">
                  Nuestra esencia
                </a>
                <a href="#impacto" className="btn btn--secondary">
                  Nuestro impacto
                </a>
              </div>

              <div className="hero__card">
                <span className="hero__card-tag">
                  <span className="hero__card-dot" aria-hidden="true" />
                  Salud Mental con Propósito
                </span>
                <p>
                  Transformamos el silencio en música, el dolor en propósito y la soledad en una comunidad que
                  sostiene.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="esencia" id="nosotros">
          <div className="section-heading">
            <p className="eyebrow eyebrow--violeta">Nuestra Esencia</p>
            <h2>Para volver a empezar</h2>
          </div>

          <div className="esencia__cards">
            {ESENCIA.map((item, i) => (
              <article className="esencia__card" key={item.title}>
                {i > 0 && <hr className="esencia__divider" />}
                <div className="esencia__row">
                  <span className="esencia__icon" style={{ background: item.iconBg }}>
                    {item.icon}
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="impacto" id="impacto">
          <div className="section-heading section-heading--left">
            <p className="eyebrow eyebrow--violeta-dark">Impacto</p>
            <h2>Explora nuestro impacto</h2>
          </div>

          <div className="impacto__grid">
            {IMPACTO.map((item) => (
              <article className="impacto__card" key={item.title}>
                <div
                  className="impacto__media"
                  role="img"
                  aria-label={item.title}
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="impacto__body">
                  <span
                    className="impacto__tag"
                    style={{ background: item.tagColor, color: item.tagText ?? '#fff' }}
                  >
                    {item.tag}
                  </span>
                  <p className="impacto__title">{item.title}</p>
                  <p className="impacto__text">{item.text}</p>
                  <a className="impacto__link" href={item.href}>
                    {item.link}
                    <ChevronRight />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="donaciones" id="donar">
          <div className="donaciones__card">
            <div className="donaciones__media" role="img" aria-label="Manos unidas en comunidad" />
            <div className="donaciones__body">
              <p className="eyebrow eyebrow--violeta-dark">Apóyanos</p>
              <h2>Tu donación salva mañanas</h2>
              <p className="donaciones__text">
                Cada aporte nos permite seguir ofreciendo sesiones de apoyo, talleres artísticos y el
                mantenimiento de nuestras líneas de escucha activa.
              </p>
              <div className="donaciones__ctas">
                <a href="#donar" className="btn btn--support">
                  Quiero donar
                  <ArrowRight />
                </a>
                <a href="#voluntariado" className="btn btn--outline" id="voluntariado">
                  Quiero ser voluntario
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="sponsors" aria-label="Instituciones que confían en nosotros">
          <p className="sponsors__heading">Instituciones que confían en nosotros</p>
          <div className="sponsors__row">
            {SPONSORS.map((logo) => (
              <span className="sponsors__logo" key={logo}>
                {logo}
              </span>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
