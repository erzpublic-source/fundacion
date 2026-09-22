import { useEffect, useRef } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import HeroParticles from './HeroParticles'
import heroImage from '../../assets/images/hero.jpg'
import impactoHistorias from '../../assets/images/impacto-historias.jpg'
import impactoEventos from '../../assets/images/impacto-eventos.jpg'
import impactoVoluntariado from '../../assets/images/impacto-voluntariado.jpg'
import donacionesImage from '../../assets/images/donaciones.jpg'
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

function VolunteerIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden="true">
      <path d="M15 11L10.85 6.95C10.3333 6.45 9.89583 5.89583 9.5375 5.2875C9.17917 4.67917 9 4.01667 9 3.3C9 2.38333 9.32083 1.60417 9.9625 0.9625C10.6042 0.320833 11.3833 0 12.3 0C12.8333 0 13.3333 0.1125 13.8 0.3375C14.2667 0.5625 14.6667 0.866667 15 1.25C15.3333 0.866667 15.7333 0.5625 16.2 0.3375C16.6667 0.1125 17.1667 0 17.7 0C18.6167 0 19.3958 0.320833 20.0375 0.9625C20.6792 1.60417 21 2.38333 21 3.3C21 4.01667 20.825 4.67917 20.475 5.2875C20.125 5.89583 19.6917 6.45 19.175 6.95L15 11V11M15 8.2L17.725 5.525C18.0417 5.20833 18.3333 4.87083 18.6 4.5125C18.8667 4.15417 19 3.75 19 3.3C19 2.93333 18.875 2.625 18.625 2.375C18.375 2.125 18.0667 2 17.7 2C17.4667 2 17.2458 2.04583 17.0375 2.1375C16.8292 2.22917 16.65 2.36667 16.5 2.55L15 4.35L13.5 2.55C13.35 2.36667 13.1708 2.22917 12.9625 2.1375C12.7542 2.04583 12.5333 2 12.3 2C11.9333 2 11.625 2.125 11.375 2.375C11.125 2.625 11 2.93333 11 3.3C11 3.75 11.1333 4.15417 11.4 4.5125C11.6667 4.87083 11.9583 5.20833 12.275 5.525L15 8.2V8.2M6 16.5L12.95 18.4L18.9 16.55C18.8167 16.4 18.6958 16.2708 18.5375 16.1625C18.3792 16.0542 18.2 16 18 16H12.95C12.5 16 12.1417 15.9833 11.875 15.95C11.6083 15.9167 11.3333 15.85 11.05 15.75L8.725 14.975L9.275 13.025L11.3 13.7C11.5833 13.7833 11.9167 13.85 12.3 13.9C12.6833 13.95 13.25 13.9833 14 14V14V14V14C14 13.8167 13.9458 13.6417 13.8375 13.475C13.7292 13.3083 13.6 13.2 13.45 13.15L7.6 11V11V11H6V16.5V16.5M0 20V9H7.6C7.71667 9 7.83333 9.0125 7.95 9.0375C8.06667 9.0625 8.175 9.09167 8.275 9.125L14.15 11.3C14.7 11.5 15.1458 11.85 15.4875 12.35C15.8292 12.85 16 13.4 16 14H18C18.8333 14 19.5417 14.275 20.125 14.825C20.7083 15.375 21 16.1 21 17V18L13 20.5L6 18.55V18.55V20H0V20M2 18H4V11H2V18V18M15 4.35V4.35V4.35V4.35V4.35V4.35V4.35V4.35V4.35V4.35V4.35V4.35V4.35V4.35V4.35V4.35V4.35V4.35" fill="currentColor" />
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
          el.style.backgroundPosition = `center calc(50% + ${offset}px)`
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
            <HeroParticles />
            <div
              className="hero__media"
              role="img"
              aria-label="Dos mujeres conversando en un ambiente cálido y acogedor"
              ref={heroParallaxRef}
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            <div className="hero__content">
              <h1 className="hero__title">
                Un espacio seguro{' '}para
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
              <a className="impacto__card" key={item.title} href={item.href}>
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
                  <span className="impacto__link">
                    {item.link}
                    <ChevronRight />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="donaciones" id="donar">
          <div className="donaciones__card">
            <div
              className="donaciones__media"
              role="img"
              aria-label="Manos unidas en comunidad"
              style={{ backgroundImage: `url(${donacionesImage})` }}
            />
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
                <a href="#voluntariado" className="btn btn--secondary" id="voluntariado">
                  Quiero ser voluntario
                  <VolunteerIcon />
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
