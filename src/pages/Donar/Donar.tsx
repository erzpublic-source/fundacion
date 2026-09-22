import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import heroImage from '../../assets/images/donar-hero.jpg'
import donarAhoraImage from '../../assets/images/donar-personas-ahora.jpg'
import donarEspecieImage from '../../assets/images/donar-personas-especie.jpg'
import './Donar.css'

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M2 8h12M9 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 14s-5.5-3.36-5.5-7.2C2.5 4.62 4.12 3 6.1 3c1.14 0 2.22.56 2.9 1.44C9.68 3.56 10.76 3 11.9 3c1.98 0 3.6 1.62 3.6 3.8C15.5 10.64 8 14 8 14Z" />
    </svg>
  )
}

interface DonationCard {
  title: string
  text: string
  action: string
  photoLabel: string
  image?: string
}

const PERSONAS_CARDS: DonationCard[] = [
  {
    title: 'Donar ahora',
    text: 'Realiza un aporte económico directo, único o mensual, y sé parte de la solución sosteniendo nuestros programas de salud mental y acogida.',
    action: 'Hacer donación monetaria',
    photoLabel: 'Foto — Donar ahora',
    image: donarAhoraImage,
  },
  {
    title: 'Donar en especie',
    text: 'Apóyanos donando materiales educativos, herramientas de arte, o insumos que optimizan el desarrollo de nuestros talleres de bienestar.',
    action: 'Ver lista de necesidades',
    photoLabel: 'Foto — Donar en especie',
    image: donarEspecieImage,
  },
]

const EMPRESAS_CARDS: DonationCard[] = [
  {
    title: 'Donaciones Corporativas',
    text: 'Financia de manera directa proyectos específicos de educación emocional en escuelas o impulsa la sostenibilidad de nuestras líneas de emergencia.',
    action: 'Donar como empresa',
    photoLabel: 'Foto — Donaciones Corporativas',
  },
  {
    title: 'Alianzas y Especie',
    text: 'Aporta recursos técnicos, espacios de capacitación o productos propios que beneficien directamente el ecosistema de apoyo de la fundación.',
    action: 'Proponer una alianza',
    photoLabel: 'Foto — Alianzas y Especie',
  },
]

interface DonationGridProps {
  eyebrowless?: boolean
  background: string
  heading: string
  lead: string
  cards: DonationCard[]
}

function DonationGrid({ background, heading, lead, cards }: DonationGridProps) {
  return (
    <section className="donar-grid-section" style={{ background }}>
      <div className="section-heading">
        <h2>{heading}</h2>
        <p className="donar-grid-section__lead">{lead}</p>
      </div>

      <div className="donar-grid-section__grid">
        {cards.map((card) => (
          <button type="button" className="donar-card" key={card.title}>
            <div
              className="donar-card__media"
              role="img"
              aria-label={card.photoLabel}
              style={card.image ? { backgroundImage: `url(${card.image})` } : undefined}
            >
              {!card.image && <span>{card.photoLabel}</span>}
            </div>
            <div className="donar-card__body">
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <span className="donar-card__link">
                <HeartIcon />
                {card.action}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

export default function Donar() {
  return (
    <>
      <Navbar />

      <main>
        <section className="donar-hero">
          <span className="donar-hero__blob donar-hero__blob--a" aria-hidden="true" />
          <span className="donar-hero__blob donar-hero__blob--b" aria-hidden="true" />

          <div className="donar-hero__inner">
            <div className="donar-hero__content">
              <h1 className="donar-hero__title">
                Tu aporte puede
                <br />
                <strong>cambiar una vida</strong>
              </h1>

              <div className="donar-hero__ctas">
                <button type="button" className="btn btn--support">
                  Quiero donar
                  <ArrowRight />
                </button>
                <button type="button" className="btn btn--secondary">
                  Quiero ayudar
                </button>
              </div>
            </div>

            <div className="donar-hero__media-wrap">
              <div
                className="donar-hero__media"
                role="img"
                aria-label="Foto — Mano recibiendo luz cálida"
                style={{ backgroundImage: `url(${heroImage})` }}
              />

              <div className="donar-hero__card">
                <span className="donar-hero__card-tag">
                  <span className="donar-hero__card-dot" aria-hidden="true" />
                  Un día más puede comenzar contigo.
                </span>
                <p>
                  Cada donación nos ayuda a brindar orientación, educación emocional, acompañamiento psicosocial y
                  atención en salud mental a personas que necesitan una oportunidad para continuar.
                </p>
              </div>
            </div>
          </div>
        </section>

        <DonationGrid
          background="#f5eff7"
          heading="Donación Personas"
          lead="Tu generosidad personal es el motor que nos permite transformar vidas. Elige cómo quieres sumar hoy:"
          cards={PERSONAS_CARDS}
        />

        <DonationGrid
          background="#fff7f9"
          heading="Donación Empresas"
          lead="Tu empresa puede ser parte del cambio social. Juntos podemos construir un impacto mayor y responsable:"
          cards={EMPRESAS_CARDS}
        />
      </main>

      <Footer />
    </>
  )
}
