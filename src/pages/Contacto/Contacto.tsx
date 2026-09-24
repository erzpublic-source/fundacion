import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import LegalModal from '../../components/LegalModal/LegalModal'
import './Contacto.css'

// Set this to your PHP (or other) endpoint once it's deployed on a server
// that can run it (GitHub Pages only serves static files). Until then, the
// form stays fully usable but submitting surfaces the "error" state below.
const CONTACTO_ENDPOINT = ''

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="5" r="2.6" />
      <path d="M2.5 14c.6-2.8 2.9-4.5 5.5-4.5s4.9 1.7 5.5 4.5" strokeLinecap="round" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" />
      <path d="M2 4l6 4.5L14 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SubjectIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <path d="M5 6h6M5 9h4" strokeLinecap="round" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M8 14.5s5-4.4 5-8.3A5 5 0 0 0 3 6.2c0 3.9 5 8.3 5 8.3Z" strokeLinejoin="round" />
      <circle cx="8" cy="6.2" r="1.8" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path
        d="M3.3 2.5h2.1l1 3-1.5 1.2a8 8 0 0 0 4.4 4.4l1.2-1.5 3 1v2.1c0 .7-.6 1.3-1.4 1.2-5-.5-9-4.5-9.5-9.5-.1-.8.5-1.4 1.2-1.4Z"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WhatsappIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M2 14l1-3.2A6 6 0 1 1 5.6 13L2 14Z" strokeLinejoin="round" />
      <path d="M5.3 5.8c.2 1.6 1.9 3.3 3.5 3.5.6.1 1-.4.8-1l-.4-.9-1 .2a3 3 0 0 1-1.6-1.6l.2-1-.9-.4c-.6-.2-1.1.2-1 .8Z" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M1.5 8h13M8 1.5c1.8 1.8 2.8 4.1 2.8 6.5S9.8 12.7 8 14.5C6.2 12.7 5.2 10.4 5.2 8S6.2 3.3 8 1.5Z" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 1.5h5.5L12.5 4.5V14.5H4Z" strokeLinejoin="round" />
      <path d="M9.5 1.5v3h3M6 8.5h4M6 11h4" strokeLinecap="round" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#25b46a" strokeWidth="1.7" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.5l2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e0455a" strokeWidth="1.7" aria-hidden="true">
      <path d="M12 3 22 20H2L12 3Z" strokeLinejoin="round" />
      <path d="M12 9.5v4.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.9" fill="#e0455a" stroke="none" />
    </svg>
  )
}

const SCHEDULE = [
  { label: 'Lunes a Viernes', hours: '8:00 AM - 5:00 PM', note: 'Jornada continua sin cierre al almuerzo', tone: 'normal' as const },
  { label: 'Sábados', hours: '9:00 AM - 1:00 PM', note: 'Solo citas programadas', tone: 'normal' as const },
  { label: 'Domingos y Festivos', hours: 'Cerrado', note: 'Canal de crisis SOS activo 24/7', tone: 'closed' as const },
]

const DIGITAL_CHANNELS = [
  { icon: <PhoneIcon />, label: 'Teléfono Principal', value: '+57 (601) 234-5678' },
  { icon: <WhatsappIcon />, label: 'WhatsApp Institucional', value: '+57 300 123 4567' },
  { icon: <MailIcon />, label: 'Correo Electrónico', value: 'contacto@fundacionundiamas.org' },
  { icon: <GlobeIcon />, label: 'Sitio Web', value: 'www.fundacionundiamas.org' },
]

const REFERRAL_STAFF = [
  {
    initials: 'CT',
    role: 'Responsable de Atención',
    name: 'Dra. Camila Torres',
    text: 'Atención clínica primaria y orientación a beneficiarios',
  },
  {
    initials: 'FM',
    role: 'Coordinación de Proyectos',
    name: 'Lic. Felipe Mendoza',
    text: 'Alianzas institucionales, programas de voluntariado y donaciones',
  },
]

interface ContactFields {
  nombre: string
  correo: string
  asunto: string
  mensaje: string
}

const INITIAL_FIELDS: ContactFields = { nombre: '', correo: '', asunto: '', mensaje: '' }

const NOMBRE_MAX_LENGTH = 30
const ASUNTO_MAX_LENGTH = 30
const MENSAJE_MAX_LENGTH = 700
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

export default function Contacto() {
  const [fields, setFields] = useState<ContactFields>(INITIAL_FIELDS)
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [correoTouched, setCorreoTouched] = useState(false)

  const isCorreoValid = useMemo(() => EMAIL_PATTERN.test(fields.correo.trim()), [fields.correo])

  const isFormValid = useMemo(() => {
    return (
      fields.nombre.trim() !== '' &&
      isCorreoValid &&
      fields.asunto.trim() !== '' &&
      fields.mensaje.trim() !== '' &&
      aceptaPrivacidad
    )
  }, [fields, isCorreoValid, aceptaPrivacidad])

  function updateField(key: keyof ContactFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  async function submitForm() {
    if (!isFormValid) return
    setSubmitStatus('loading')
    try {
      if (!CONTACTO_ENDPOINT) throw new Error('endpoint-not-configured')

      const response = await fetch(CONTACTO_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (!response.ok) throw new Error('request-failed')

      setSubmitStatus('success')
    } catch {
      setSubmitStatus('error')
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void submitForm()
  }

  function resetForm() {
    setFields(INITIAL_FIELDS)
    setAceptaPrivacidad(false)
    setSubmitStatus('idle')
  }

  return (
    <>
      <Navbar />

      <main>
        <section className="contacto-hero">
          <div className="contacto-hero__inner">
            <div className="contacto-hero__content">
              <h1 className="contacto-hero__title">Información de Contacto</h1>
              <p className="contacto-hero__lead">
                La Fundación Un Día Más mantiene canales abiertos para la comunicación con sus beneficiarios,
                donantes y la comunidad en general. A continuación, se detallan los medios oficiales de contacto
                para consultas, donaciones o solicitudes de apoyo.
              </p>
              <p className="contacto-hero__lead">
                Por favor, complete el siguiente formulario para ponerse en contacto con nuestro equipo. Le
                responderemos a la mayor brevedad posible.
              </p>

              <a href="#ubicacion-direccion" className="btn btn--primary contacto-hero__cta">
                Nuestros datos
              </a>
            </div>

            <form className="contacto-form" onSubmit={handleSubmit}>
              <h2 className="contacto-form__title">Escríbenos tu Mensaje</h2>

              <div className="contacto-field">
                <label htmlFor="nombre">Nombre Completo</label>
                <div className="contacto-field__control">
                  <UserIcon />
                  <input
                    id="nombre"
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={fields.nombre}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('nombre', e.target.value)}
                    maxLength={NOMBRE_MAX_LENGTH}
                    required
                  />
                </div>
              </div>

              <div className="contacto-field">
                <label htmlFor="correo">Correo Electrónico</label>
                <div className={`contacto-field__control${correoTouched && !isCorreoValid ? ' contacto-field__control--error' : ''}`}>
                  <MailIcon />
                  <input
                    id="correo"
                    type="email"
                    placeholder="Ej: correo@ejemplo.com"
                    value={fields.correo}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('correo', e.target.value)}
                    onBlur={() => setCorreoTouched(true)}
                    required
                  />
                </div>
                {correoTouched && !isCorreoValid && (
                  <p className="contacto-field__error">Ingresa un correo válido, ej: correo@ejemplo.com</p>
                )}
              </div>

              <div className="contacto-field">
                <label htmlFor="asunto">Asunto</label>
                <div className="contacto-field__control">
                  <SubjectIcon />
                  <input
                    id="asunto"
                    type="text"
                    placeholder="Ej: Solicitud de información, donaciones, apoyo psicológico"
                    value={fields.asunto}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('asunto', e.target.value)}
                    maxLength={ASUNTO_MAX_LENGTH}
                    required
                  />
                </div>
              </div>

              <div className="contacto-field">
                <label htmlFor="mensaje">Mensaje</label>
                <textarea
                  id="mensaje"
                  placeholder="Escribe aquí tu mensaje en detalle..."
                  value={fields.mensaje}
                  onChange={(e) => updateField('mensaje', e.target.value)}
                  maxLength={MENSAJE_MAX_LENGTH}
                  required
                />
                <span className="contacto-field__counter">
                  {fields.mensaje.length}/{MENSAJE_MAX_LENGTH}
                </span>
              </div>

              <div className="contacto-checkbox">
                <input
                  id="acepta-privacidad"
                  type="checkbox"
                  checked={aceptaPrivacidad}
                  onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                />
                <label htmlFor="acepta-privacidad">
                  Acepto la{' '}
                  <button type="button" className="contacto-link" onClick={() => setPrivacyOpen(true)}>
                    Política de Privacidad
                  </button>{' '}
                  y el tratamiento de mis datos personales conforme a la ley.
                </label>
              </div>

              <button type="submit" className="btn btn--primary-solid contacto-submit" disabled={!isFormValid || submitStatus === 'loading'}>
                {submitStatus === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          </div>
        </section>

        <section className="contacto-ubicacion" id="ubicacion-direccion">
          <div className="section-heading section-heading--left">
            <h2>Ubicación y Dirección</h2>
            <p className="contacto-ubicacion__lead">
              Para visitas presenciales o envío de correspondencia física, por favor dirigirse a nuestra sede
              principal:
            </p>
          </div>

          <div className="contacto-ubicacion__grid">
            <div className="contacto-address-card">
              <span className="contacto-address-card__icon">
                <LocationIcon />
              </span>
              <h3>Sede Central</h3>
              <p>
                <strong>Dirección física:</strong> Calle 45 #8-12, Of. 402
              </p>
              <p>
                <strong>Ciudad:</strong> Bogotá D.C.
              </p>
              <p>
                <strong>País:</strong> Colombia
              </p>
            </div>

            <div className="contacto-map" role="img" aria-label="Mapa — Ubicación de la Sede Central">
              <span>Mapa — Sede Central</span>
            </div>
          </div>

          <div className="section-heading section-heading--left contacto-horarios__heading">
            <h2>Horarios de Atención</h2>
            <p className="contacto-ubicacion__lead">
              Nuestro equipo administrativo está disponible para atender sus inquietudes en los siguientes
              horarios:
            </p>
          </div>

          <div className="contacto-horarios__grid">
            {SCHEDULE.map((slot) => (
              <div className={`contacto-horario-card${slot.tone === 'closed' ? ' contacto-horario-card--closed' : ''}`} key={slot.label}>
                <span className="contacto-horario-card__label">{slot.label}</span>
                <span className="contacto-horario-card__hours">{slot.hours}</span>
                <span className="contacto-horario-card__note">{slot.note}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="contacto-canales">
          <div className="contacto-canales__col">
            <h2>Canales Digitales y Telefónicos</h2>
            <ul className="contacto-canales__list">
              {DIGITAL_CHANNELS.map((channel) => (
                <li key={channel.label}>
                  <span className="contacto-canales__icon">{channel.icon}</span>
                  <div>
                    <span className="contacto-canales__label">{channel.label}</span>
                    <span className="contacto-canales__value">{channel.value}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="contacto-canales__col">
            <h2>Personal de Enlace</h2>
            <p className="contacto-canales__lead">
              Si requiere una comunicación directa con un área específica o el representante legal, puede
              contactar a:
            </p>

            <ul className="contacto-staff__list">
              {REFERRAL_STAFF.map((person) => (
                <li key={person.name}>
                  <span className="contacto-staff__avatar">{person.initials}</span>
                  <div>
                    <span className="contacto-staff__role">{person.role}</span>
                    <span className="contacto-staff__name">{person.name}</span>
                    <span className="contacto-staff__text">{person.text}</span>
                  </div>
                </li>
              ))}
              <li>
                <span className="contacto-staff__avatar contacto-staff__avatar--doc">
                  <DocumentIcon />
                </span>
                <div>
                  <span className="contacto-staff__role">Documento de Referencia</span>
                  <span className="contacto-link contacto-link--doc">Dossier_Corporativo_Fundacion_Un_Dia_Mas.pdf</span>
                </div>
              </li>
            </ul>

            <p className="contacto-canales__footnote">
              * Esta información fue actualizada por última vez el 15 de febrero de 2026.
            </p>
          </div>
        </section>
      </main>

      <Footer />

      <LegalModal
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        onAccept={() => {
          setAceptaPrivacidad(true)
          setPrivacyOpen(false)
        }}
        title="Políticas de Privacidad"
        updatedLabel="Última actualización: Febrero 2026"
        note="Al aceptar, autorizas el tratamiento de tus datos de contacto."
      >
        <div>
          <h4>1. Recopilación de datos</h4>
          <p>
            Recopilamos el nombre, correo electrónico y el contenido del mensaje que nos compartes a través de
            este formulario, con el único fin de responder tu consulta o solicitud.
          </p>
        </div>
        <div>
          <h4>2. Uso de la información</h4>
          <p>
            La información suministrada se usa exclusivamente para gestionar tu comunicación con la Fundación Un
            Día Más. No utilizamos tus datos con fines publicitarios de terceros ni comerciales.
          </p>
        </div>
        <div>
          <h4>3. Compartir datos con terceros</h4>
          <p>Nos comprometemos a no vender, alquilar ni transferir tu información personal a terceros.</p>
        </div>
        <div>
          <h4>4. Derechos del usuario</h4>
          <p>
            Puedes solicitar el acceso, rectificación o eliminación de tus datos en cualquier momento
            escribiéndonos directamente a nuestro correo de contacto.
          </p>
        </div>
      </LegalModal>

      {submitStatus === 'success' && (
        <div className="form-alert-backdrop" role="presentation">
          <div className="form-alert" role="dialog" aria-modal="true" aria-label="Mensaje enviado con éxito">
            <button type="button" className="form-alert__close" onClick={resetForm} aria-label="Cerrar">
              ×
            </button>
            <CheckCircleIcon />
            <h3>¡Mensaje enviado con éxito!</h3>
            <p>Tu mensaje ha sido recibido. Nos pondremos en contacto contigo pronto para continuar con tu proceso.</p>
            <button type="button" className="btn btn--primary form-alert__action" onClick={resetForm}>
              Enviar otro mensaje
            </button>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="form-alert-backdrop" role="presentation">
          <div className="form-alert" role="dialog" aria-modal="true" aria-label="Error al enviar el mensaje">
            <button type="button" className="form-alert__close" onClick={() => setSubmitStatus('idle')} aria-label="Cerrar">
              ×
            </button>
            <WarningIcon />
            <h3>Error al enviar el mensaje</h3>
            <p>Hubo un problema al procesar tu solicitud. Por favor, verifica tu conexión e inténtalo de nuevo en unos momentos.</p>
            <button type="button" className="btn btn--primary form-alert__action" onClick={() => void submitForm()}>
              Reintentar envío
            </button>
            <button type="button" className="btn btn--secondary form-alert__action" onClick={() => setSubmitStatus('idle')}>
              Volver al formulario
            </button>
          </div>
        </div>
      )}
    </>
  )
}
