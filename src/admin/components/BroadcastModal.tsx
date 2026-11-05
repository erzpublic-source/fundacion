import { useRef, useState } from 'react'
import { useAdminContacts } from '../AdminContactsContext'
import './BroadcastModal.css'

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
    </svg>
  )
}

interface BroadcastModalProps {
  activeCount: number
  onClose: () => void
  onSent: (sent: number, failed: number) => void
}

export default function BroadcastModal({ activeCount, onClose, onSent }: BroadcastModalProps) {
  const { sending, uploadMailingImage, sendBroadcast } = useAdminContacts()

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [ctaLabel, setCtaLabel] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isValid = title.trim() !== '' && message.trim() !== ''
  const canSubmit = isValid && !sending && !uploadingImage

  async function handleImageChange(file: File | undefined) {
    if (!file) return
    setUploadingImage(true)
    setError(null)
    try {
      const url = await uploadMailingImage(file)
      setImageUrl(url)
    } catch {
      setError('No pudimos subir la imagen. Intenta de nuevo.')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleSend() {
    if (!canSubmit) return
    setError(null)
    try {
      const result = await sendBroadcast({
        title: title.trim(),
        message: message.trim(),
        imageUrl,
        ctaUrl: ctaUrl.trim() || null,
        ctaLabel: ctaLabel.trim() || null,
      })
      onSent(result.sent, result.failed)
    } catch {
      setError('No pudimos enviar la invitación. Intenta de nuevo.')
    }
  }

  return (
    <div className="broadcast-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="broadcast-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="broadcast-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="broadcast-modal__header">
          <h3 id="broadcast-modal-title">Nueva invitación</h3>
          <button type="button" className="broadcast-modal__close" onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <p className="broadcast-modal__hint">
          Se enviará a los <strong>{activeCount}</strong> contactos activos de la base de datos.
        </p>

        <div className="broadcast-modal__field">
          <label htmlFor="broadcast-title">Título / asunto</label>
          <input id="broadcast-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
        </div>

        <div className="broadcast-modal__field">
          <label htmlFor="broadcast-message">Mensaje</label>
          <textarea
            id="broadcast-message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
          />
        </div>

        <div className="broadcast-modal__field">
          <label>Imagen (opcional)</label>
          {imageUrl ? (
            <div className="broadcast-modal__image-preview">
              <img src={imageUrl} alt="" />
              <button type="button" className="admin-link" onClick={() => setImageUrl(null)}>
                Quitar imagen
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? 'Subiendo...' : 'Adjuntar imagen'}
              </button>
              <p className="broadcast-modal__image-hint">Resolución recomendada: 960 × 320 px (JPG o PNG).</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="broadcast-modal__file-input"
            onChange={(e) => void handleImageChange(e.target.files?.[0])}
          />
        </div>

        <div className="broadcast-modal__row">
          <div className="broadcast-modal__field">
            <label htmlFor="broadcast-cta-label">Texto del botón (opcional)</label>
            <input id="broadcast-cta-label" type="text" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
          </div>
          <div className="broadcast-modal__field">
            <label htmlFor="broadcast-cta-url">Enlace del botón (opcional)</label>
            <input id="broadcast-cta-url" type="url" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} />
          </div>
        </div>

        {error && <p className="broadcast-modal__error">{error}</p>}

        <button type="button" className="btn btn--primary broadcast-modal__submit" onClick={handleSend} disabled={!canSubmit}>
          {sending ? 'Enviando...' : `Enviar a ${activeCount} contactos`}
        </button>
      </div>
    </div>
  )
}
