import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import featuredImage from '../../assets/images/eventos-featured.jpg'
import escuchaActivaImage from '../../assets/images/eventos-escucha-activa.jpg'
import aireLibreImage from '../../assets/images/eventos-aire-libre.jpg'
import circulosApoyoImage from '../../assets/images/eventos-circulos-apoyo.jpg'
import './Eventos.css'

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="2" />
      <path d="M2 6.5h12M5 1.5v2M11 1.5v2" strokeLinecap="round" />
    </svg>
  )
}

function DeviceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="8.5" rx="1.5" />
      <path d="M5.5 14h5M8 11v3" strokeLinecap="round" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M8 14.5s5-4.4 5-8.3A5 5 0 0 0 3 6.2c0 3.9 5 8.3 5 8.3Z" strokeLinejoin="round" />
      <circle cx="8" cy="6.2" r="1.8" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface UpcomingEvent {
  weekday: string
  day: string
  time: string
  title: string
  sede: string
  address: string
  text: string
  photoLabel: string
  image: string
}

const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    weekday: 'SÁB',
    day: '1',
    time: '1 de Febrero 7:00 am - 10:00 am',
    title: 'Talleres de Escucha Activa',
    sede: 'Sede Central',
    address: 'Calle de la Calma 123, Bogotá',
    text: 'Un espacio seguro para aprender técnicas de comunicación empática y fortalecer los vínculos comunitarios a través del diálogo consciente.',
    photoLabel: 'Foto — Talleres de Escucha Activa',
    image: escuchaActivaImage,
  },
  {
    weekday: 'DOM',
    day: '2',
    time: '2 de Febrero 10:00 am - 12:30 pm',
    title: 'Jornadas al Aire Libre',
    sede: 'Parque del Retiro',
    address: 'Paseo de Fernán Núñez, Ibagué',
    text: 'Conectamos con la naturaleza y la comunidad en una mañana de actividades recreativas diseñadas para reducir el estrés y la ansiedad.',
    photoLabel: 'Foto — Jornadas al Aire Libre',
    image: aireLibreImage,
  },
  {
    weekday: 'LUN',
    day: '3',
    time: '3 de Febrero 6:00 pm - 7:30 pm',
    title: 'Círculos de Apoyo',
    sede: 'Centro Comunitario',
    address: 'Av. de la Esperanza 45, Ibagué',
    text: 'Un encuentro íntimo para compartir experiencias y encontrar consuelo en la compañía de otros que transitan caminos similares.',
    photoLabel: 'Foto — Círculos de Apoyo',
    image: circulosApoyoImage,
  },
]

export default function Eventos() {
  return (
    <>
      <Navbar />

      <main>
        <section className="eventos-hero">
          <span className="eventos-hero__blob eventos-hero__blob--a" aria-hidden="true" />
          <span className="eventos-hero__blob eventos-hero__blob--b" aria-hidden="true" />

          <div className="eventos-hero__inner">
            <h1 className="eventos-hero__title">Eventos</h1>
            <p className="eventos-hero__lead">
              Historias que también se cuentan en imágenes. Conoce los encuentros, actividades y experiencias que
              dan vida a la misión de la Fundación Un Día Más.
            </p>
          </div>
        </section>

        <section className="eventos-featured">
          <article className="eventos-featured__card">
            <div className="eventos-featured__body">
              <span className="eventos-featured__tag">Evento Destacado</span>
              <h2>Lanzamiento Fundación Un Día Más</h2>
              <p className="eventos-featured__text">
                Un encuentro para celebrar el inicio de un camino hacia el bienestar emocional compartido.
              </p>

              <ul className="eventos-featured__meta">
                <li>
                  <CalendarIcon />
                  Próximamente
                </li>
                <li>
                  <DeviceIcon />
                  Presencial / Virtual
                </li>
                <li>
                  <LocationIcon />
                  Por confirmar
                </li>
              </ul>

              <button type="button" className="btn btn--primary-solid">
                Quiero saber más
              </button>
            </div>

            <div
              className="eventos-featured__media"
              role="img"
              aria-label="Foto — Lanzamiento Fundación Un Día Más"
              style={{ backgroundImage: `url(${featuredImage})` }}
            />
          </article>
        </section>

        <section className="eventos-upcoming">
          <div className="section-heading">
            <h2>Próximos Eventos</h2>
            <p className="eventos-upcoming__lead">Encuentra un espacio para ti en nuestras próximas actividades.</p>
          </div>

          <div className="eventos-upcoming__list">
            {UPCOMING_EVENTS.map((event) => (
              <article className="evento-item" key={event.title}>
                <div className="evento-item__date">
                  <span className="evento-item__weekday">{event.weekday}</span>
                  <span className="evento-item__day">{event.day}</span>
                </div>

                <p className="evento-item__time evento-item__time--mobile">
                  <ClockIcon />
                  {event.time}
                </p>

                <div
                  className="evento-item__thumb evento-item__thumb--mobile"
                  role="img"
                  aria-label={event.photoLabel}
                  style={{ backgroundImage: `url(${event.image})` }}
                />

                <div className="evento-item__body">
                  <p className="evento-item__time evento-item__time--desktop">
                    <ClockIcon />
                    {event.time}
                  </p>
                  <h3>{event.title}</h3>
                  <p className="evento-item__place">
                    <strong>{event.sede}</strong> {event.address}
                  </p>
                  <p className="evento-item__text">{event.text}</p>
                </div>

                <div
                  className="evento-item__thumb evento-item__thumb--desktop"
                  role="img"
                  aria-label={event.photoLabel}
                  style={{ backgroundImage: `url(${event.image})` }}
                />
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
