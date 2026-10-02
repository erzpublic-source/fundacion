import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import BackLink from '../components/BackLink'
import { useAdminEvents } from '../AdminEventsContext'
import type { DiscountCode, DiscountKind, EventKind } from '../adminEventsTypes'
import '../AdminAuth.css'
import '../AdminShared.css'
import './EventForm.css'

function UploadIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 15V4M7 8.5 12 4l5 4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M2.5 4.5h11M6 4.5v-1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M3.5 4.5l.6 8.2a1.5 1.5 0 0 0 1.5 1.3h4.8a1.5 1.5 0 0 0 1.5-1.3l.6-8.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="7.5" width="10" height="6.5" rx="1.5" />
      <path d="M5 7.5V5a3 3 0 0 1 6 0v2.5" strokeLinecap="round" />
    </svg>
  )
}

const EVENT_KINDS: { value: EventKind; label: string }[] = [
  { value: 'pago', label: 'De pago' },
  { value: 'gratis', label: 'Gratis' },
  { value: 'hibrido', label: 'Híbrido' },
]

function formatThousands(digits: string): string {
  if (!digits) return ''
  return Number(digits).toLocaleString('es-CO')
}

// "29/feb/2026" — abbreviated-month mask shown under the native date input
// so the selected date reads unambiguously regardless of the browser's own
// (locale- and OS-dependent) date-field display format.
function formatDateMask(value: string): string {
  if (!value) return ''
  const parsed = new Date(`${value}T00:00:00`)
  const day = String(parsed.getDate()).padStart(2, '0')
  const month = new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(parsed).replace('.', '')
  const year = parsed.getFullYear()
  return `${day}/${month}/${year}`
}

const DISCOUNT_KINDS: { value: DiscountKind; label: string }[] = [
  { value: 'percent', label: '% Descuento' },
  { value: 'fixed', label: 'Monto fijo' },
  { value: 'free', label: 'Entrada libre' },
]

function makeCodeId(): string {
  return `code-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function describeDiscount(code: DiscountCode): string {
  if (code.kind === 'free') return 'Entrada libre'
  if (code.kind === 'percent') return `Descuento ${code.value}%`
  return `Descuento $${code.value.toLocaleString('es-CO')} COP`
}

export default function EventForm() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { getEvent, createEvent, updateEvent, uploadEventImage, saving, loading } = useAdminEvents()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const existing = useMemo(() => (id ? getEvent(id) : undefined), [id, getEvent])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [place, setPlace] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [kind, setKind] = useState<EventKind>('pago')
  const [price, setPrice] = useState('')
  const [capacity, setCapacity] = useState('100')
  // A new event starts with every "Opciones del evento" switch off — it's
  // the admin's explicit decision to publish it or mark it "Evento próximo"
  // that unlocks ticket configuration, not a default.
  const [published, setPublished] = useState(false)
  const [isAnnouncement, setIsAnnouncement] = useState(false)
  const [salesPaused, setSalesPaused] = useState(false)
  const [sinRegistro, setSinRegistro] = useState(false)
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([])
  const [newCode, setNewCode] = useState({ code: '', kind: 'percent' as DiscountKind, value: '', maxUses: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notFound, setNotFound] = useState(false)

  // "Configuración de entradas" (and, when applicable, "Códigos de
  // descuento") stays locked/disabled until the event is actually
  // published AND no longer a mere announcement — "Evento próximo" alone
  // doesn't talk about pricing yet, so it must keep this locked even once
  // the event is published.
  const configLocked = !published || isAnnouncement
  // "Pausar ventas" only makes sense on an event that's actually live and
  // sellable: published, and not merely an announcement.
  const pausarVentasLocked = !published || isAnnouncement
  // "Sin registro" only applies to Gratis events — a paid or híbrido event
  // always needs a registration step to charge or allocate a slot. When on,
  // "Cupo máximo" stops applying (nothing to track without registration).
  const capacityLocked = configLocked || (kind === 'gratis' && sinRegistro)

  useEffect(() => {
    if (!isEditing || loading) return
    if (!existing) {
      setNotFound(true)
      return
    }
    setTitle(existing.title)
    setDescription(existing.description)
    setDate(existing.date ?? '')
    setTime(existing.time ?? '')
    setPlace(existing.place)
    setImageUrl(existing.imageUrl)
    setKind(existing.kind)
    setPrice(existing.price ? String(existing.price) : '')
    setCapacity(String(existing.capacity))
    setPublished(existing.published)
    setIsAnnouncement(existing.isAnnouncement)
    setSalesPaused(existing.salesPaused)
    setSinRegistro(!existing.requiresRegistration)
    setDiscountCodes(existing.discountCodes)
  }, [isEditing, existing, loading])

  function handlePriceChange(event: ChangeEvent<HTMLInputElement>) {
    setPrice(event.target.value.replace(/\D/g, ''))
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    const url = await uploadEventImage(file)
    setImageUrl(url)
    setUploadingImage(false)
  }

  function handleAddCode() {
    const code = newCode.code.trim().toUpperCase()
    const maxUses = Number(newCode.maxUses)
    if (!code || !maxUses || maxUses <= 0) return
    const value = newCode.kind === 'free' ? 0 : Number(newCode.value)

    setDiscountCodes((prev) => [...prev, { id: makeCodeId(), code, kind: newCode.kind, value, maxUses, usedCount: 0 }])
    setNewCode({ code: '', kind: 'percent', value: '', maxUses: '' })
  }

  function handleRemoveCode(codeId: string) {
    setDiscountCodes((prev) => prev.filter((c) => c.id !== codeId))
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (title.trim() === '') next.title = 'El título es obligatorio.'
    if (place.trim() === '') next.place = 'El lugar es obligatorio.'

    if (!configLocked) {
      if (!capacityLocked) {
        const capacityNum = Number(capacity)
        if (!capacity || capacityNum <= 0) next.capacity = 'El cupo debe ser mayor a 0.'
      }

      if (kind !== 'gratis') {
        const priceNum = Number(price)
        if (!price || priceNum <= 0) next.price = 'Ingresa el valor de la entrada.'
      }
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (saving || uploadingImage) return
    if (!validate()) return

    const input = {
      title: title.trim(),
      description: description.trim(),
      date: date || null,
      time: time || null,
      place: place.trim(),
      imageUrl,
      kind,
      price: configLocked || kind === 'gratis' ? null : Number(price),
      capacity: capacityLocked ? 0 : Number(capacity),
      published,
      isAnnouncement,
      // Pausing sales is meaningless before the event is live and sellable.
      salesPaused: pausarVentasLocked ? false : salesPaused,
      // Only meaningful for Gratis — see capacityLocked above.
      requiresRegistration: kind === 'gratis' ? !sinRegistro : true,
      // No featured toggle here by design — featured is managed only from the
      // event list (see GestionEventos), never from this create/edit form.
      featured: existing?.featured ?? false,
      discountCodes: !configLocked && kind === 'hibrido' ? discountCodes : [],
    }

    if (isEditing && existing) {
      await updateEvent(existing.id, input)
    } else {
      await createEvent(input)
    }

    navigate('/admin/eventos')
  }

  if (isEditing && loading) {
    return (
      <AdminLayout>
        <p>Cargando evento...</p>
      </AdminLayout>
    )
  }

  if (notFound) {
    return (
      <AdminLayout>
        <p>No encontramos ese evento.</p>
        <Link to="/admin/eventos" className="admin-link">
          Volver a Gestión de Eventos
        </Link>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <BackLink to="/admin/eventos" label="Volver a eventos" />
      <p className="event-form__breadcrumb">
          EVENTOS &gt; {isEditing ? 'EDITAR EVENTO' : 'CREAR NUEVO EVENTO'}
        </p>
        <h1 className="event-form__title">{isEditing ? 'Editar evento' : 'Crear nuevo evento'}</h1>
        <p className="event-form__subtitle">Formule la información y configure las entradas para el próximo encuentro.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="event-form__columns">
            <section className="event-form__card">
              <h2>Información general</h2>

              <button
                type="button"
                className="event-form__dropzone"
                onClick={() => fileInputRef.current?.click()}
                style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="event-form__file-input"
                  onChange={handleImageChange}
                />
                {!imageUrl && (
                  <span className="event-form__dropzone-content">
                    {uploadingImage ? <span className="event-form__spinner" aria-hidden="true" /> : <UploadIcon />}
                    <strong>{uploadingImage ? 'Subiendo imagen...' : 'Subir imagen principal'}</strong>
                    <span>Formatos recomendados: JPG, PNG (16:9, máx. 5MB)</span>
                  </span>
                )}
                {imageUrl && uploadingImage && (
                  <span className="event-form__dropzone-overlay">
                    <span className="event-form__spinner" aria-hidden="true" />
                    Subiendo...
                  </span>
                )}
              </button>

              <div className="admin-field">
                <label htmlFor="event-title">Título del evento</label>
                <div className={`admin-field__control${errors.title ? ' admin-field__control--error' : ''}`}>
                  <input
                    id="event-title"
                    type="text"
                    placeholder="Ej. Lanzamiento Fundación Un Día Más"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                {errors.title && <p className="admin-field__error">{errors.title}</p>}
              </div>

              <div className="admin-field">
                <label htmlFor="event-description">Descripción breve</label>
                <div className="admin-field__control admin-field__control--textarea">
                  <textarea
                    id="event-description"
                    placeholder="Describa el propósito y detalles clave del evento para los asistentes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="event-form__row">
                <div className="admin-field">
                  <label htmlFor="event-date">Fecha</label>
                  <div className="admin-field__control event-form__date-control">
                    <input
                      id="event-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={date ? 'event-form__date-input--masked' : undefined}
                    />
                    {/* Overlays the browser's own (locale/OS-dependent) date
                        text with a consistent dd/mmm/aaaa mask, while the
                        native input stays underneath for the calendar
                        picker and click/keyboard interaction. */}
                    {date && <span className="event-form__date-mask">{formatDateMask(date)}</span>}
                  </div>
                </div>
                <div className="admin-field">
                  <label htmlFor="event-time">Hora</label>
                  <div className="admin-field__control">
                    <input id="event-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="admin-field">
                <label htmlFor="event-place">Lugar</label>
                <div className={`admin-field__control${errors.place ? ' admin-field__control--error' : ''}`}>
                  <input
                    id="event-place"
                    type="text"
                    placeholder="Ej. Sede Central, Calle de la Calma 123"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                  />
                </div>
                {errors.place && <p className="admin-field__error">{errors.place}</p>}
              </div>
            </section>

            <div className="event-form__side">
              <section className="event-form__card">
                <h2>Opciones del evento</h2>
                <div className="event-form__toggles event-form__toggles--vertical">
                  <label className="event-form__toggle-row">
                    <span>
                      <strong>Publicar evento</strong>
                      <small>Visible para el público general</small>
                    </span>
                    <span className={`event-form__switch${published ? ' event-form__switch--on' : ''}`}>
                      <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                      <span className="event-form__switch-knob" />
                    </span>
                  </label>

                  <label className="event-form__toggle-row">
                    <span>
                      <strong>Evento próximo</strong>
                      <small>Visible en la web, aún sin venta de entradas</small>
                    </span>
                    <span className={`event-form__switch${isAnnouncement ? ' event-form__switch--on' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isAnnouncement}
                        onChange={(e) => setIsAnnouncement(e.target.checked)}
                      />
                      <span className="event-form__switch-knob" />
                    </span>
                  </label>

                  <label className={`event-form__toggle-row${pausarVentasLocked ? ' event-form__toggle-row--disabled' : ''}`}>
                    <span>
                      <strong>Pausar ventas</strong>
                      <small>Detener adquisición temporalmente</small>
                    </span>
                    <span className={`event-form__switch event-form__switch--pause${salesPaused && !pausarVentasLocked ? ' event-form__switch--on' : ''}`}>
                      <input
                        type="checkbox"
                        checked={salesPaused && !pausarVentasLocked}
                        disabled={pausarVentasLocked}
                        onChange={(e) => setSalesPaused(e.target.checked)}
                      />
                      <span className="event-form__switch-knob" />
                    </span>
                  </label>

                  {kind === 'gratis' && (
                    <label className="event-form__toggle-row">
                      <span>
                        <strong>Evento sin registro</strong>
                        <small>Público general, no requiere inscripción previa</small>
                      </span>
                      <span className={`event-form__switch${sinRegistro ? ' event-form__switch--on' : ''}`}>
                        <input
                          type="checkbox"
                          checked={sinRegistro}
                          onChange={(e) => setSinRegistro(e.target.checked)}
                        />
                        <span className="event-form__switch-knob" />
                      </span>
                    </label>
                  )}
                </div>
              </section>

              <section className={`event-form__card${configLocked ? ' event-form__card--locked' : ''}`}>
                <div className="event-form__card-header">
                  <h2>Configuración de entradas</h2>
                  {configLocked && (
                    <span className="event-form__lock-badge">
                      <LockIcon /> Bloqueado
                    </span>
                  )}
                </div>
                {configLocked && (
                  <p className="event-form__lock-hint">
                    Actívalo publicando el evento. Un aviso "Evento próximo" aún no habla de costos.
                  </p>
                )}

                <fieldset className="event-form__fieldset" disabled={configLocked}>
                  <div className="admin-field">
                    <span className="event-form__label">Tipo de evento</span>
                    <div className="event-form__segmented">
                      {EVENT_KINDS.map((k) => (
                        <button
                          key={k.value}
                          type="button"
                          className={`event-form__segment${kind === k.value ? ' event-form__segment--active' : ''}`}
                          onClick={() => {
                            setKind(k.value)
                            if (k.value !== 'gratis') setSinRegistro(false)
                          }}
                        >
                          {k.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="event-form__row">
                    <div className={`admin-field${capacityLocked ? ' admin-field--disabled' : ''}`}>
                      <label htmlFor="event-capacity">Cupo máximo</label>
                      <div className={`admin-field__control${errors.capacity ? ' admin-field__control--error' : ''}`}>
                        <input
                          id="event-capacity"
                          type="number"
                          min={1}
                          placeholder="100"
                          value={capacity}
                          onChange={(e) => setCapacity(e.target.value)}
                          disabled={capacityLocked}
                        />
                      </div>
                      {capacityLocked ? (
                        <p className="event-form__lock-hint">Un evento sin registro no lleva aforo.</p>
                      ) : (
                        errors.capacity && <p className="admin-field__error">{errors.capacity}</p>
                      )}
                    </div>

                    {kind !== 'gratis' && (
                      <div className="admin-field">
                        <label htmlFor="event-price">Precio por entrada</label>
                        <div className={`admin-field__control${errors.price ? ' admin-field__control--error' : ''}`}>
                          <input
                            id="event-price"
                            type="text"
                            inputMode="numeric"
                            placeholder="25.000"
                            value={formatThousands(price)}
                            onChange={handlePriceChange}
                          />
                        </div>
                        {errors.price && <p className="admin-field__error">{errors.price}</p>}
                      </div>
                    )}
                  </div>
                </fieldset>
              </section>

              {kind === 'hibrido' && (
                <section className={`event-form__card${configLocked ? ' event-form__card--locked' : ''}`}>
                  <div className="event-form__card-header">
                    <h2>Códigos de descuento</h2>
                    <span className="status-pill status-pill--proximamente">Híbrido</span>
                  </div>

                  <fieldset className="event-form__fieldset" disabled={configLocked}>
                    {discountCodes.length > 0 && (
                      <ul className="event-form__codes-list">
                        {discountCodes.map((code) => (
                          <li key={code.id}>
                            <div>
                              <strong>{code.code}</strong>
                              <span>{describeDiscount(code)}</span>
                            </div>
                            <div className="event-form__codes-list-right">
                              <span>
                                {code.usedCount}/{code.maxUses}
                              </span>
                              <button type="button" onClick={() => handleRemoveCode(code.id)} aria-label={`Quitar código ${code.code}`}>
                                <TrashIcon />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="event-form__add-code">
                      <input
                        type="text"
                        placeholder="Código"
                        value={newCode.code}
                        onChange={(e) => setNewCode((c) => ({ ...c, code: e.target.value }))}
                      />
                      <select
                        value={newCode.kind}
                        onChange={(e) => setNewCode((c) => ({ ...c, kind: e.target.value as DiscountKind }))}
                      >
                        {DISCOUNT_KINDS.map((k) => (
                          <option key={k.value} value={k.value}>
                            {k.label}
                          </option>
                        ))}
                      </select>
                      {newCode.kind === 'percent' && (
                        <input
                          type="number"
                          min={0}
                          placeholder="%"
                          value={newCode.value}
                          onChange={(e) => setNewCode((c) => ({ ...c, value: e.target.value }))}
                        />
                      )}
                      {newCode.kind === 'fixed' && (
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="10.000"
                          value={formatThousands(newCode.value)}
                          onChange={(e) => setNewCode((c) => ({ ...c, value: e.target.value.replace(/\D/g, '') }))}
                        />
                      )}
                      <input
                        type="number"
                        min={1}
                        placeholder="Usos"
                        value={newCode.maxUses}
                        onChange={(e) => setNewCode((c) => ({ ...c, maxUses: e.target.value }))}
                      />
                      <button type="button" className="btn btn--secondary" onClick={handleAddCode}>
                        + Agregar código
                      </button>
                    </div>
                  </fieldset>
                </section>
              )}
            </div>
          </div>

          <div className="event-form__footer">
            <div className="event-form__footer-actions">
              <Link to="/admin/eventos" className="admin-link">
                Cancelar
              </Link>
              <button type="submit" className="btn btn--primary" disabled={saving || uploadingImage}>
                {saving ? 'Guardando...' : 'Guardar evento'}
              </button>
            </div>
          </div>
        </form>
    </AdminLayout>
  )
}
