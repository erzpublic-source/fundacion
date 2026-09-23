import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import LegalModal from '../../components/LegalModal/LegalModal'
import './Voluntariado.css'

// Set this to your PHP endpoint once it's deployed on a server that can run
// it (GitHub Pages only serves static files, it cannot execute PHP), e.g.
// 'https://tudominio.com/api/procesar-voluntariado.php'. Until then, the form
// stays fully usable but submitting surfaces the "error" state below.
const VOLUNTARIADO_ENDPOINT = ''

const MAX_FILE_SIZE_BYTES = 7 * 1024 * 1024

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.2-4.8A8 8 0 1 1 21 12Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GraduationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M2 8.5 12 4l10 4.5-10 4.5L2 8.5Z" strokeLinejoin="round" />
      <path d="M6 10.7v4.3c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 8.5V15" strokeLinecap="round" />
    </svg>
  )
}

function HeartPulseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path
        d="M20 8.6c0 4.3-4.4 7.6-8 10.4-3.6-2.8-8-6.1-8-10.4A4.6 4.6 0 0 1 12 5.5a4.6 4.6 0 0 1 8 3.1Z"
        strokeLinejoin="round"
      />
      <path d="M6 12h2.5l1.5-3 2 6 1.5-3H16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="5" r="2.6" />
      <path d="M2.5 14c.6-2.8 2.9-4.5 5.5-4.5s4.9 1.7 5.5 4.5" strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="2" />
      <path d="M2 6.5h12M5 1.5v2M11 1.5v2" strokeLinecap="round" />
    </svg>
  )
}

function StethoscopeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 2v4a3 3 0 0 0 6 0V2" strokeLinecap="round" />
      <path d="M7 9v1.5a3.5 3.5 0 0 0 7 0V9" strokeLinecap="round" />
      <circle cx="13.2" cy="8.8" r="1" />
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

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path
        d="M3.3 2.5h2.1l1 3-1.5 1.2a8 8 0 0 0 4.4 4.4l1.2-1.5 3 1v2.1c0 .7-.6 1.3-1.4 1.2-5-.5-9-4.5-9.5-9.5-.1-.8.5-1.4 1.2-1.4Z"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
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

const ROLES = [
  {
    icon: <ChatIcon />,
    title: 'Intervención Primaria',
    text: 'Brindar apoyo psicológico inicial a personas en crisis de salud mental.',
  },
  {
    icon: <GraduationIcon />,
    title: 'Talleres de Prevención',
    text: 'Facilitar espacios psicoeducativos para comunidades vulnerables, colegios y familias.',
  },
  {
    icon: <HeartPulseIcon />,
    title: 'Asesoría Clínica',
    text: 'Colaborar en el diseño de estrategias terapéuticas para nuestros beneficiarios constantes.',
  },
  {
    icon: <ChartIcon />,
    title: 'Investigación y Desarrollo',
    text: 'Aportar desde la evidencia científica para mejorar nuestros protocolos de atención.',
  },
]

interface FormFields {
  nombre: string
  fecha: string
  especialidad: string
  ciudad: string
  celular: string
}

const INITIAL_FIELDS: FormFields = {
  nombre: '',
  fecha: '',
  especialidad: '',
  ciudad: '',
  celular: '',
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

export default function Voluntariado() {
  const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isFormValid = useMemo(() => {
    return (
      fields.nombre.trim() !== '' &&
      fields.fecha.trim() !== '' &&
      fields.especialidad.trim() !== '' &&
      fields.ciudad.trim() !== '' &&
      fields.celular.trim() !== '' &&
      file !== null &&
      fileError === null &&
      aceptaPrivacidad &&
      aceptaTerminos
    )
  }, [fields, file, fileError, aceptaPrivacidad, aceptaTerminos])

  function updateField(key: keyof FormFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null

    if (!selected) {
      setFile(null)
      setFileError(null)
      return
    }

    const isPdf = selected.type === 'application/pdf' || selected.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setFile(null)
      setFileError('Solo se aceptan archivos en formato PDF.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setFile(null)
      setFileError('El archivo supera el máximo permitido de 7 MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setFile(selected)
    setFileError(null)
  }

  async function submitForm() {
    if (!isFormValid || !file) return

    setSubmitStatus('loading')

    try {
      if (!VOLUNTARIADO_ENDPOINT) {
        throw new Error('endpoint-not-configured')
      }

      const formData = new FormData()
      formData.append('nombre', fields.nombre)
      formData.append('fecha_disponibilidad', fields.fecha)
      formData.append('especialidad', fields.especialidad)
      formData.append('ciudad', fields.ciudad)
      formData.append('celular', fields.celular)
      formData.append('hoja_de_vida', file)

      const response = await fetch(VOLUNTARIADO_ENDPOINT, { method: 'POST', body: formData })
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
    setFile(null)
    setFileError(null)
    setAceptaPrivacidad(false)
    setAceptaTerminos(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setSubmitStatus('idle')
  }

  return (
    <>
      <Navbar />

      <main>
        <section className="voluntariado-hero">
          <span className="voluntariado-hero__blob voluntariado-hero__blob--a" aria-hidden="true" />
          <span className="voluntariado-hero__blob voluntariado-hero__blob--b" aria-hidden="true" />

          <div className="voluntariado-hero__inner">
            <div className="voluntariado-hero__media" role="img" aria-label="Foto — Equipo de profesionales de la salud">
              <span>Foto — Equipo de profesionales</span>
            </div>

            <h1 className="voluntariado-hero__title">Tu conocimiento puede salvar vidas</h1>
            <p className="voluntariado-hero__lead">
              Transforma el dolor en esperanza a través de tu profesión. En la Fundación Un Día Más, creemos que
              cada vida cuenta y que tu experiencia clínica es la herramienta más poderosa para prevenir el
              suicidio y promover el bienestar emocional en quienes más lo necesitan.
            </p>

            <a href="#formulario-voluntariado" className="btn btn--primary">
              Quiero apoyar
            </a>
          </div>
        </section>

        <section className="voluntariado-roles">
          <div className="section-heading">
            <h2>El rol del profesional de la salud en nuestra misión</h2>
            <p className="voluntariado-roles__lead">
              Los profesionales de la salud mental, especialmente los psicólogos, son el pilar fundamental de
              nuestras iniciativas. Su apoyo nos permite ampliar el alcance de nuestros programas y ofrecer una
              red de contención profesional y humana. Como voluntario, podrás participar en:
            </p>
          </div>

          <div className="voluntariado-roles__grid">
            {ROLES.map((role) => (
              <article className="voluntariado-role-card" key={role.title}>
                <span className="voluntariado-role-card__icon">{role.icon}</span>
                <h3>{role.title}</h3>
                <p>{role.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="voluntariado-form-section" id="formulario-voluntariado">
          <div className="section-heading">
            <h2>Formulario de Registro para Voluntariado Profesional</h2>
            <p className="voluntariado-form-section__lead">
              Si deseas poner tu talento al servicio de la vida, por favor completa la siguiente información para
              iniciar tu proceso de vinculación.
            </p>
          </div>

          <form className="voluntariado-form" onSubmit={handleSubmit}>
            <h3 className="voluntariado-form__title">Información del Aspirante</h3>

            <div className="voluntariado-field">
              <label htmlFor="nombre">Nombre del Profesional</label>
              <div className="voluntariado-field__control">
                <UserIcon />
                <input
                  id="nombre"
                  type="text"
                  placeholder="Nombre completo"
                  value={fields.nombre}
                  onChange={(e) => updateField('nombre', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="voluntariado-field">
              <label htmlFor="fecha">Fecha de Disponibilidad</label>
              <div className="voluntariado-field__control">
                <CalendarIcon />
                <input
                  id="fecha"
                  type="date"
                  value={fields.fecha}
                  onChange={(e) => updateField('fecha', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="voluntariado-field">
              <label htmlFor="especialidad">Especialidad Clínica</label>
              <div className="voluntariado-field__control">
                <StethoscopeIcon />
                <input
                  id="especialidad"
                  type="text"
                  placeholder="Ej: Psicología Clínica, Cognitivo-Conductual"
                  value={fields.especialidad}
                  onChange={(e) => updateField('especialidad', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="voluntariado-field">
              <label htmlFor="ciudad">Ciudad de Residencia</label>
              <div className="voluntariado-field__control">
                <LocationIcon />
                <input
                  id="ciudad"
                  type="text"
                  placeholder="Ciudad, País"
                  value={fields.ciudad}
                  onChange={(e) => updateField('ciudad', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="voluntariado-field">
              <label htmlFor="celular">Número de celular</label>
              <div className="voluntariado-field__control">
                <PhoneIcon />
                <input
                  id="celular"
                  type="tel"
                  placeholder="Ingresa número de celular"
                  value={fields.celular}
                  onChange={(e) => updateField('celular', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="voluntariado-field">
              <label htmlFor="hoja-de-vida">Hoja de Vida / Credenciales (máximo 7 MB, solo PDF)</label>
              <div className={`voluntariado-field__control${fileError ? ' voluntariado-field__control--error' : ''}`}>
                <DocumentIcon />
                <input
                  id="hoja-de-vida"
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  required
                />
              </div>
              {file && !fileError && <p className="voluntariado-field__hint">{file.name}</p>}
              {fileError && <p className="voluntariado-field__error">{fileError}</p>}
            </div>

            <div className="voluntariado-checkbox">
              <input
                id="acepta-privacidad"
                type="checkbox"
                checked={aceptaPrivacidad}
                onChange={(e) => setAceptaPrivacidad(e.target.checked)}
              />
              <label htmlFor="acepta-privacidad">
                Acepto la{' '}
                <button type="button" className="voluntariado-link" onClick={() => setPrivacyOpen(true)}>
                  Política de Privacidad
                </button>{' '}
                y el tratamiento de mis datos personales conforme a la ley vigente de protección de datos.
              </label>
            </div>

            <div className="voluntariado-checkbox">
              <input
                id="acepta-terminos"
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
              />
              <label htmlFor="acepta-terminos">
                Acepto los{' '}
                <button type="button" className="voluntariado-link" onClick={() => setTermsOpen(true)}>
                  Términos y Condiciones
                </button>{' '}
                de la Fundación Un Día Más para el programa de voluntariado profesional.
              </label>
            </div>

            <button type="submit" className="btn btn--primary-solid voluntariado-submit" disabled={!isFormValid || submitStatus === 'loading'}>
              {submitStatus === 'loading' ? 'Enviando...' : 'Enviar solicitud'}
            </button>

            <p className="voluntariado-form__footnote">
              Nuestro equipo de coordinación se pondrá en contacto contigo para una entrevista inicial y la
              verificación de credenciales profesionales. Gracias por considerar a la Fundación Un Día Más como el
              espacio para ejercer tu vocación con impacto social.
            </p>
          </form>
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
        note="Al aceptar, autorizas el tratamiento de tus credenciales clínicas."
      >
        <div>
          <h4>1. Recopilación de datos</h4>
          <p>
            Recopilamos información personal de identificación de nuestros postulantes a voluntarios médicos y de
            salud, incluyendo nombre, especialidad clínica, credenciales profesionales, datos de contacto y hoja
            de vida con el único fin de validar su idoneidad para las brigadas de apoyo psicoeducativo.
          </p>
        </div>
        <div>
          <h4>2. Uso de la información</h4>
          <p>
            La información suministrada se procesa con fines organizativos internos para coordinar el
            voluntariado profesional en la Fundación Un Día Más. No utilizamos sus datos con fines publicitarios
            de terceros ni comerciales.
          </p>
        </div>
        <div>
          <h4>3. Compartir datos con terceros</h4>
          <p>
            Nos comprometemos a no vender, alquilar ni transferir su información personal. Sus credenciales e
            historial solo podrán ser verificados ante los entes certificadores oficiales de salud de acuerdo a
            las regulaciones vigentes de salud mental.
          </p>
        </div>
        <div>
          <h4>4. Derechos del usuario</h4>
          <p>
            Usted mantiene todos sus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición). Podrá retirar
            su consentimiento de voluntariado o solicitar la eliminación total de su hoja de vida escribiéndonos
            de forma directa.
          </p>
        </div>
      </LegalModal>

      <LegalModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccept={() => {
          setAceptaTerminos(true)
          setTermsOpen(false)
        }}
        title="Términos y Condiciones"
        updatedLabel="Última actualización: Febrero 2026"
        note="Al aceptar, confirmas que cumples los requisitos del programa de voluntariado profesional."
      >
        <div>
          <p>Contenido pendiente por definir. Se actualizará con el texto oficial de Términos y Condiciones.</p>
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
            <p>Tu mensaje ha sido recibido. Nos pondremos en contacto contigo pronto para continuar con tu proceso de vinculación.</p>
            <button type="button" className="btn btn--primary form-alert__action" onClick={resetForm}>
              Enviar otro mensaje
            </button>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="form-alert-backdrop" role="presentation">
          <div className="form-alert" role="dialog" aria-modal="true" aria-label="Error al enviar el mensaje">
            <button
              type="button"
              className="form-alert__close"
              onClick={() => setSubmitStatus('idle')}
              aria-label="Cerrar"
            >
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
