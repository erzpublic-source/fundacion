import { useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import VideoModal from '../../components/VideoModal/VideoModal'
import donacionesImage from '../../assets/images/donaciones.jpg'
import historiasFeaturedImage from '../../assets/images/historias-featured.jpg'
import historiasAvatar1 from '../../assets/images/historias-avatar-1.jpg'
import historiasAvatar2 from '../../assets/images/historias-avatar-2.jpg'
import historiasCard1Image from '../../assets/images/historias-card1.jpg'
import historiasCard2Image from '../../assets/images/historias-card2.jpg'
import historiasAcusticoGuitarra from '../../assets/images/historias-acustico-guitarra.jpg'
import historiasAcusticoPiano from '../../assets/images/historias-acustico-piano.jpg'
import { homeAnchor } from '../../utils/links'
import './Historias.css'

const CHANNEL_URL = 'https://www.youtube.com/@fundacionUnD%C3%ADaM%C3%A1s'

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

function HeadphonesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M4.5 13.5H1.5C1.0875 13.5 0.734375 13.3531 0.440625 13.0594C0.146875 12.7656 0 12.4125 0 12V6.75C0 5.8125 0.178125 4.93437 0.534375 4.11562C0.890625 3.29688 1.37188 2.58437 1.97812 1.97812C2.58437 1.37188 3.29688 0.890625 4.11562 0.534375C4.93437 0.178125 5.8125 0 6.75 0C7.6875 0 8.56562 0.178125 9.38437 0.534375C10.2031 0.890625 10.9156 1.37188 11.5219 1.97812C12.1281 2.58437 12.6094 3.29688 12.9656 4.11562C13.3219 4.93437 13.5 5.8125 13.5 6.75V12C13.5 12.4125 13.3531 12.7656 13.0594 13.0594C12.7656 13.3531 12.4125 13.5 12 13.5H9V7.5H12V6.75C12 5.2875 11.4906 4.04688 10.4719 3.02813C9.45312 2.00938 8.2125 1.5 6.75 1.5C5.2875 1.5 4.04688 2.00938 3.02813 3.02813C2.00938 4.04688 1.5 5.2875 1.5 6.75V7.5H4.5V13.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

const ENTREVISTAS_CARDS = [
  {
    title: 'Conversaciones sobre el miedo',
    text: 'Una charla íntima sobre cómo afrontar la ansiedad en el día a día y encontrar herramientas de apoyo.',
    image: historiasCard1Image,
    videoId: '1v4xV_w_y0s',
  },
  {
    title: 'Resiliencia comunitaria',
    text: 'Líderes locales comparten sus historias de recuperación colectiva y la importancia del tejido social.',
    image: historiasCard2Image,
    videoId: 'C5xYXV6LsWc',
  },
]

const ACUSTICOS_CARDS = [
  {
    title: 'JAIME VALENCIA - UN DÍA MÁS',
    text: 'Una interpretación íntima de su canción resiliente, llena de historia y esperanza.',
    image: historiasAcusticoGuitarra,
  },
  {
    title: 'VOCES DE ESPERANZA - SESIÓN EN VIVO',
    text: 'Un ensamble local que une voces para sanar a través de melodías compartidas.',
    image: historiasAcusticoGuitarra,
  },
  {
    title: 'MELODÍAS QUE SANAN - PIANO SOLO',
    text: 'Una pieza instrumental diseñada para acompañar momentos de reflexión y calma.',
    image: historiasAcusticoPiano,
  },
]

interface ActiveVideo {
  title: string
  videoId: string
  startSeconds?: number
}

export default function Historias() {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null)

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
              <button
                type="button"
                className="historias-pill-btn"
                onClick={() =>
                  setActiveVideo({ title: 'Un Día Más con JAIME VALENCIA', videoId: 'C5xYXV6LsWc', startSeconds: 2 })
                }
              >
                <PlayIcon />
                Ver entrevista
              </button>
            </div>
          </article>

          <div className="historias-entrevistas__grid">
            {ENTREVISTAS_CARDS.map((card) => (
              <article className="historias-card" key={card.title}>
                <button
                  type="button"
                  className="historias-card__media-wrap"
                  onClick={() => setActiveVideo({ title: card.title, videoId: card.videoId })}
                  aria-label={`Reproducir: ${card.title}`}
                >
                  <img src={card.image} alt={card.title} className="historias-card__media" />
                  <span className="historias-card__play" aria-hidden="true">
                    <PlayIcon />
                  </span>
                </button>
                <div className="historias-card__body">
                  <h4>{card.title}</h4>
                  <p>{card.text}</p>
                  <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="historias-card__link">
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
              <a
                href={CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="historias-acustico"
                key={card.title}
              >
                <div className="historias-acustico__media-wrap">
                  <img src={card.image} alt={card.title} className="historias-acustico__media" />
                </div>
                <div className="historias-acustico__frame">
                  <div className="historias-acustico__body">
                    <h4>{card.title}</h4>
                    <p>{card.text}</p>
                    <span className="historias-acustico__link">
                      <HeadphonesIcon />
                      Disfrutar el acústico en el canal
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="historias-youtube">
            <span className="historias-youtube__icon">
              <VideoIcon />
            </span>
            <h3>Nuestra comunidad en YouTube</h3>
            <p>Suscríbete para ver entrevistas, acústicos y momentos que sanan.</p>
            <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="historias-youtube__btn">
              <VideoIcon />
              Ir al canal de YouTube
            </a>
          </div>
        </section>
      </main>

      <Footer />

      {activeVideo && (
        <VideoModal
          open
          onClose={() => setActiveVideo(null)}
          title={activeVideo.title}
          videoId={activeVideo.videoId}
          startSeconds={activeVideo.startSeconds}
          channelUrl={`https://www.youtube.com/watch?v=${activeVideo.videoId}`}
        />
      )}
    </>
  )
}
