import { useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import VideoModal from '../../components/VideoModal/VideoModal'
import donacionesImage from '../../assets/images/donaciones.jpg'
import historiasFeaturedImage from '../../assets/images/historias-featured.jpg'
import historiasAvatar1 from '../../assets/images/historias-avatar-1.jpg'
import historiasAvatar2 from '../../assets/images/historias-avatar-2.jpg'
import { homeAnchor } from '../../utils/links'
import './Historias.css'

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <path d="M3 1.5v11l9-5.5-9-5.5Z" />
    </svg>
  )
}

function ArrowRightSmall() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M1 4.5h7M5 1.5l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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

function VideoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4Z" />
    </svg>
  )
}

interface PhotoPlaceholderProps {
  label: string
  className?: string
}

function PhotoPlaceholder({ label, className }: PhotoPlaceholderProps) {
  return (
    <div className={`photo-placeholder${className ? ` ${className}` : ''}`} role="img" aria-label={label}>
      <span>{label}</span>
    </div>
  )
}

const ENTREVISTAS_CARDS = [
  {
    title: 'Conversaciones sobre el miedo',
    text: 'Una charla íntima sobre cómo afrontar la ansiedad en el día a día y encontrar herramientas de apoyo.',
    photoLabel: 'Foto — Conversaciones sobre el miedo',
  },
  {
    title: 'Resiliencia comunitaria',
    text: 'Líderes locales comparten sus historias de recuperación colectiva y la importancia del tejido social.',
    photoLabel: 'Foto — Resiliencia comunitaria',
  },
]

const ACUSTICOS_CARDS = [
  {
    title: 'JAIME VALENCIA - UN DÍA MÁS',
    text: 'Una interpretación íntima de su canción resiliente, llena de historia y esperanza.',
    photoLabel: 'Foto — Jaime Valencia Acústico',
  },
  {
    title: 'VOCES DE ESPERANZA - SESIÓN EN VIVO',
    text: 'Un ensamble local que une voces para sanar a través de melodías compartidas.',
    photoLabel: 'Foto — Voces de Esperanza',
  },
  {
    title: 'MELODÍAS QUE SANAN - PIANO SOLO',
    text: 'Una pieza instrumental diseñada para acompañar momentos de reflexión y calma.',
    photoLabel: 'Foto — Piano Solo',
  },
]

export default function Historias() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <>
      <Navbar />

      <main>
        <section className="historias-hero">
          <span className="historias-hero__blob historias-hero__blob--a" aria-hidden="true" />
          <span className="historias-hero__blob historias-hero__blob--b" aria-hidden="true" />
          <div className="historias-hero__inner">
            <div className="historias-hero__avatars" aria-hidden="true">
              <img src={historiasAvatar1} alt="" className="historias-hero__avatar" />
              <img src={historiasAvatar2} alt="" className="historias-hero__avatar" />
            </div>

            <h1 className="historias-hero__title">
              Historias que merecen
              <br />
              <strong>ser escuchadas</strong>
            </h1>

            <p className="historias-hero__lead">
              Personalidades, líderes, artistas y personas de la vida cotidiana comparten conversaciones reales
              sobre salud mental, desafíos, aprendizajes y nuevas oportunidades.
            </p>
            <p className="historias-hero__note">Descubre las entrevistas y Acústicos en nuestro canal de YouTube.</p>

            <div className="historias-hero__ctas">
              <a href="#entrevistas" className="btn btn--primary">
                Ver Entrevistas
              </a>
              <a href="#acusticos" className="btn btn--secondary">
                Ver Acústicos
              </a>
            </div>
          </div>
        </section>

        <section className="historias-entrevistas" id="entrevistas">
          <div className="section-heading">
            <h2>Entrevistas</h2>
            <p className="historias-entrevistas__lead">
              Descubre entrevistas auténticas con personalidades, artistas y personas de la vida cotidiana, junto a
              encuentros acústicos íntimos que conectan música, emociones y salud mental.
            </p>
          </div>

          <article className="historias-entrevistas__featured">
            <div className="historias-entrevistas__featured-media">
              <img src={historiasFeaturedImage} alt="Jaime Valencia tocando guitarra en su sala" />
            </div>
            <div className="historias-entrevistas__featured-body">
              <span className="historias-entrevistas__tag">Destacado</span>
              <h3>Un Día Más con JAIME VALENCIA</h3>
              <p>
                Jaime Valencia es uno de los artistas más icónicos desde finales de los años 50´s con música de
                protesta el cual hoy en día sigue siendo reconocido y activo en los escenarios. Hablaremos de su
                vida personal y la salud mental.
              </p>
              <button type="button" className="historias-pill-btn" onClick={() => setIsVideoOpen(true)}>
                <PlayIcon />
                Ver entrevista
              </button>
            </div>
          </article>

          <div className="historias-entrevistas__grid">
            {ENTREVISTAS_CARDS.map((card) => (
              <article className="historias-card" key={card.title}>
                <div className="historias-card__media-wrap">
                  <PhotoPlaceholder label={card.photoLabel} className="historias-card__media" />
                  <span className="historias-card__play" aria-hidden="true">
                    <PlayIcon />
                  </span>
                </div>
                <div className="historias-card__body">
                  <h4>{card.title}</h4>
                  <p>{card.text}</p>
                  <a href="#canal" className="historias-card__link">
                    Ver en canal
                    <ArrowRightSmall />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="historias-donacion">
          <div className="historias-donacion__card">
            <div
              className="historias-donacion__media"
              role="img"
              aria-label="Manos unidas en comunidad"
              style={{ backgroundImage: `url(${donacionesImage})` }}
            />
            <div className="historias-donacion__body">
              <p className="eyebrow eyebrow--violeta-dark">Apóyanos</p>
              <h2>Tu donación salva mañanas</h2>
              <p className="historias-donacion__text">
                Cada aporte nos permite seguir ofreciendo sesiones de apoyo, talleres artísticos y el mantenimiento
                de nuestras líneas de escucha activa.
              </p>
              <div className="historias-donacion__ctas">
                <a href={homeAnchor('donar')} className="btn btn--support">
                  Quiero donar
                  <ArrowRight />
                </a>
                <a href={homeAnchor('voluntariado')} className="btn btn--secondary">
                  Quiero ser voluntario
                  <VolunteerIcon />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="historias-acusticos" id="acusticos">
          <div className="section-heading">
            <h2>Voces que inspiran, música que acompaña</h2>
          </div>

          <div className="historias-acusticos__grid">
            {ACUSTICOS_CARDS.map((card) => (
              <article className="historias-acustico" key={card.title}>
                <PhotoPlaceholder label={card.photoLabel} className="historias-acustico__media" />
                <div className="historias-acustico__body">
                  <h4>{card.title}</h4>
                  <p>{card.text}</p>
                  <a href="#canal" className="historias-acustico__link">
                    <PlayIcon />
                    Disfrutar el acústico en el canal
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="historias-youtube">
            <span className="historias-youtube__icon">
              <VideoIcon />
            </span>
            <h3>Nuestra comunidad en YouTube</h3>
            <p>Suscríbete para ver entrevistas, acústicos y momentos que sanan.</p>
            <a href="#canal" className="historias-youtube__btn">
              <VideoIcon />
              Ir al canal de YouTube
            </a>
          </div>
        </section>
      </main>

      <Footer />

      <VideoModal
        open={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        title="Un Día Más con JAIME VALENCIA"
        videoId="C5xYXV6LsWc"
        startSeconds={2}
        channelUrl="https://www.youtube.com/watch?v=C5xYXV6LsWc"
      />
    </>
  )
}
