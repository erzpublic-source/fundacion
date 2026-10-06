import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties, FormEvent } from 'react'
import type ReCAPTCHA from 'react-google-recaptcha'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import LegalModal from '../../components/LegalModal/LegalModal'
import RecaptchaField from '../../components/RecaptchaField/RecaptchaField'
import { PRIVACY_POLICY_TITLE, PRIVACY_POLICY_UPDATED_LABEL, PrivacyPolicyContent } from '../../content/privacyPolicy'
import { TERMS_CONDITIONS_TITLE, TERMS_CONDITIONS_UPDATED_LABEL, TermsConditionsContent } from '../../content/termsConditions'
import { useHoneypot } from '../../hooks/useHoneypot'
import { HONEYPOT_STYLE } from '../../utils/honeypotStyle'
import heroImage from '../../assets/images/voluntariado-hero.jpg'
import heroImageMobile from '../../assets/images/voluntariado-hero-mobile.jpg'
import { COLOMBIA_CITIES } from '../../data/colombiaCities'
import { supabase } from '../../lib/supabaseClient'
import './Voluntariado.css'

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

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" />
      <path d="M2 4l6 4.5L14 4" strokeLinecap="round" strokeLinejoin="round" />
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

function CheckCircleSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#25b46a" strokeWidth="1.6" aria-hidden="true">
      <circle cx="8" cy="8" r="7" />
      <path d="M5 8.3l2 2L11.2 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RemoveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M2 2l8 8M10 2l-8 8" strokeLinecap="round" />
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
  especialidad: string
  ciudad: string
  celular: string
  correo: string
}

const INITIAL_FIELDS: FormFields = {
  nombre: '',
  especialidad: '',
  ciudad: '',
  celular: '',
  correo: '',
}

const CELULAR_LENGTH = 10
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const NOMBRE_LENGTH = 40
const ESPECIALIDAD_LENGTH = 40
// Letters (including accented vowels and ñ) and spaces only — no numbers or symbols.
const LETTERS_ONLY_PATTERN = /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g

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
  const [ciudadOpen, setCiudadOpen] = useState(false)
  const [correoTouched, setCorreoTouched] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const honeypot = useHoneypot()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ciudadBlurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isCiudadValid = useMemo(
    () => COLOMBIA_CITIES.some((city) => city.toLowerCase() === fields.ciudad.trim().toLowerCase()),
    [fields.ciudad],
  )

  const isCorreoValid = useMemo(() => EMAIL_PATTERN.test(fields.correo.trim()), [fields.correo])

  const filteredCities = useMemo(() => {
    const query = fields.ciudad.trim().toLowerCase()
    if (query === '') return COLOMBIA_CITIES
    return COLOMBIA_CITIES.filter((city) => city.toLowerCase().includes(query))
  }, [fields.ciudad])

  const isFormValid = useMemo(() => {
    return (
      fields.nombre.trim() !== '' &&
      fields.especialidad.trim() !== '' &&
      isCiudadValid &&
      fields.celular.trim().length === CELULAR_LENGTH &&
      isCorreoValid &&
      file !== null &&
      fileError === null &&
      aceptaPrivacidad &&
      aceptaTerminos &&
      captchaToken !== null
    )
  }, [fields, isCiudadValid, isCorreoValid, file, fileError, aceptaPrivacidad, aceptaTerminos, captchaToken])

  function updateField(key: keyof FormFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  function handleCelularChange(event: ChangeEvent<HTMLInputElement>) {
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, CELULAR_LENGTH)
    // Colombian mobile numbers always start with 3 — reject an edit that
    // would leave a different leading digit instead of silently keeping it.
    if (digitsOnly.length > 0 && digitsOnly[0] !== '3') return
    updateField('celular', digitsOnly)
  }

  function handleNombreChange(event: ChangeEvent<HTMLInputElement>) {
    updateField('nombre', event.target.value.replace(LETTERS_ONLY_PATTERN, '').slice(0, NOMBRE_LENGTH))
  }

  function handleEspecialidadChange(event: ChangeEvent<HTMLInputElement>) {
    updateField('especialidad', event.target.value.replace(LETTERS_ONLY_PATTERN, '').slice(0, ESPECIALIDAD_LENGTH))
  }

  function selectCiudad(city: string) {
    updateField('ciudad', city)
    setCiudadOpen(false)
  }

  function handleCiudadBlur() {
    // Delay so a click on a dropdown option registers before the list unmounts.
    ciudadBlurTimeout.current = setTimeout(() => setCiudadOpen(false), 150)
  }

  function handleCiudadOptionMouseDown() {
    if (ciudadBlurTimeout.current) clearTimeout(ciudadBlurTimeout.current)
  }

  function handleRemoveFile() {
    setFile(null)
    setFileError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
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

    // A bot filled the decoy field — pretend the submission worked so it
    // doesn't learn anything and retry differently, but never actually send it.
    if (honeypot.isSuspicious) {
      setSubmitStatus('success')
      return
    }

    setSubmitStatus('loading')

    try {
      const extensionMatch = /\.[a-zA-Z0-9]+$/.exec(file.name)
      const extension = extensionMatch ? extensionMatch[0] : '.pdf'
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`

      const { error: uploadError } = await supabase.storage.from('volunteer-cvs').upload(path, file)
      if (uploadError) throw uploadError

      const { error: insertError } = await supabase.from('volunteer_applications').insert({
        nombre: fields.nombre.trim(),
        especialidad: fields.especialidad.trim(),
        ciudad: fields.ciudad.trim(),
        celular: fields.celular.trim(),
        correo: fields.correo.trim(),
        cv_url: path,
      })
      if (insertError) throw insertError

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
    setCorreoTouched(false)
    setCaptchaToken(null)
    recaptchaRef.current?.reset()
    honeypot.reset()
    if (fileInputRef.current) fileInputRef.current.value = ''
    setSubmitStatus('idle')
  }

  return (
    <>
      <Navbar />

      <main>
        <section className="voluntariado-hero">

          <div className="voluntariado-hero__inner">
            <div className="voluntariado-hero__visual">
              <div
                className="voluntariado-hero__media"
                role="img"
                aria-label="Foto — Equipo de profesionales de la salud"
                style={
                  {
                    backgroundImage: `url(${heroImage})`,
                    '--voluntariado-hero-media-mobile': `url(${heroImageMobile})`,
                  } as CSSProperties
                }
              />
            </div>

            <div className="voluntariado-hero__content">
              <h1 className="voluntariado-hero__title">Tu conocimiento puede salvar vidas</h1>
              <p className="voluntariado-hero__lead">
                Transforma el dolor en esperanza a través de tu profesión. En la Fundación Un Día Más, creemos que
                cada vida cuenta y que tu experiencia clínica es la herramienta más poderosa para prevenir el
                suicidio y promover el bienestar emocional en quienes más lo necesitan.
              </p>

              <div className="voluntariado-hero__ctas">
                <a href="#formulario-voluntariado" className="btn btn--primary">
                  Quiero apoyar
                </a>
                <a href="#rol-profesional" className="btn btn--secondary">
                  Más información
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="voluntariado-roles" id="rol-profesional">
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
              <label htmlFor="nombre">Nombre y Apellido del Profesional</label>
              <div className="voluntariado-field__control">
                <UserIcon />
                <input
                  id="nombre"
                  type="text"
                  placeholder="Nombre y apellido completo"
                  value={fields.nombre}
                  onChange={handleNombreChange}
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
                  placeholder="Ej: Psicología Clínica"
                  value={fields.especialidad}
                  onChange={handleEspecialidadChange}
                  required
                />
              </div>
            </div>

            <div className="voluntariado-field voluntariado-field--combobox">
              <label htmlFor="ciudad">Ciudad de Residencia</label>
              <div className="voluntariado-field__control">
                <LocationIcon />
                <input
                  id="ciudad"
                  type="text"
                  role="combobox"
                  aria-expanded={ciudadOpen}
                  aria-autocomplete="list"
                  aria-controls="ciudad-listbox"
                  autoComplete="off"
                  placeholder="Escribe para buscar tu ciudad"
                  value={fields.ciudad}
                  onChange={(e) => {
                    updateField('ciudad', e.target.value)
                    setCiudadOpen(true)
                  }}
                  onFocus={() => setCiudadOpen(true)}
                  onBlur={handleCiudadBlur}
                  required
                />
              </div>
              {ciudadOpen && filteredCities.length > 0 && (
                <ul className="voluntariado-field__dropdown" id="ciudad-listbox" role="listbox">
                  {filteredCities.map((city) => (
                    <li key={city}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={city.toLowerCase() === fields.ciudad.trim().toLowerCase()}
                        onMouseDown={handleCiudadOptionMouseDown}
                        onClick={() => selectCiudad(city)}
                      >
                        {city}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {ciudadOpen && filteredCities.length === 0 && (
                <p className="voluntariado-field__hint">No encontramos esa ciudad en el listado.</p>
              )}
            </div>

            <div className="voluntariado-field">
              <label htmlFor="celular">Número de celular</label>
              <div className="voluntariado-field__control">
                <PhoneIcon />
                <input
                  id="celular"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Ingresa número de celular (10 dígitos)"
                  value={fields.celular}
                  onChange={handleCelularChange}
                  required
                />
              </div>
            </div>

            <div className="voluntariado-field">
              <label htmlFor="correo">Correo Electrónico</label>
              <div className={`voluntariado-field__control${correoTouched && !isCorreoValid ? ' voluntariado-field__control--error' : ''}`}>
                <MailIcon />
                <input
                  id="correo"
                  type="email"
                  placeholder="Ej: correo@ejemplo.com"
                  value={fields.correo}
                  onChange={(e) => updateField('correo', e.target.value)}
                  onBlur={() => setCorreoTouched(true)}
                  required
                />
              </div>
              {correoTouched && !isCorreoValid && (
                <p className="voluntariado-field__error">Ingresa un correo válido, ej: correo@ejemplo.com</p>
              )}
            </div>

            <div className="voluntariado-field">
              <label htmlFor="hoja-de-vida">Hoja de Vida / Credenciales (máximo 7 MB, solo PDF)</label>
              <div
                className={`voluntariado-field__control voluntariado-field__control--file${
                  fileError || (submitStatus === 'error' && file) ? ' voluntariado-field__control--error' : ''
                }`}
              >
                <DocumentIcon />
                {file && submitStatus === 'loading' ? (
                  <>
                    <span className="voluntariado-field__filename">{file.name}</span>
                    <span className="voluntariado-field__spinner" aria-hidden="true" />
                    <span className="voluntariado-field__file-status">Subiendo...</span>
                  </>
                ) : file ? (
                  <>
                    <span className="voluntariado-field__filename">{file.name}</span>
                    <CheckCircleSmallIcon />
                    <button
                      type="button"
                      className="voluntariado-field__file-remove"
                      onClick={handleRemoveFile}
                      aria-label="Quitar archivo adjunto"
                    >
                      <RemoveIcon />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="voluntariado-field__file-trigger"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Seleccionar archivo PDF
                  </button>
                )}
                <input
                  id="hoja-de-vida"
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="voluntariado-field__file-input"
                  tabIndex={-1}
                  disabled={submitStatus === 'loading'}
                />
              </div>
              {fileError && <p className="voluntariado-field__error">{fileError}</p>}
              {!fileError && submitStatus === 'error' && file && (
                <p className="voluntariado-field__error">
                  No se pudo subir el archivo. Verifica tu conexión e inténtalo de nuevo.
                </p>
              )}
            </div>

            {/* Honeypot: invisible to real visitors, real users never focus or fill
                it — a bot that auto-fills every field in the form does. */}
            <div style={HONEYPOT_STYLE} aria-hidden="true">
              <label htmlFor="sitio-web">Sitio web</label>
              <input
                id="sitio-web"
                name="sitio-web"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot.value}
                onChange={honeypot.onChange}
              />
            </div>

            <div className="voluntariado-field">
              <label>Verificación anti-spam</label>
              <RecaptchaField ref={recaptchaRef} onChange={setCaptchaToken} />
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
        title={PRIVACY_POLICY_TITLE}
        updatedLabel={PRIVACY_POLICY_UPDATED_LABEL}
        note="Al aceptar, autorizas el tratamiento de tus credenciales clínicas."
      >
        <PrivacyPolicyContent />
      </LegalModal>

      <LegalModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccept={() => {
          setAceptaTerminos(true)
          setTermsOpen(false)
        }}
        title={TERMS_CONDITIONS_TITLE}
        updatedLabel={TERMS_CONDITIONS_UPDATED_LABEL}
        note="Al aceptar, confirmas que cumples los requisitos del programa de voluntariado profesional."
      >
        <TermsConditionsContent />
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
