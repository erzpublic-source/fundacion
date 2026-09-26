import { useEffect } from 'react'
import './VideoModal.css'

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <path d="M3 1.5v11l9-5.5-9-5.5Z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2 2l12 12M14 2 2 14" strokeLinecap="round" />
    </svg>
  )
}

interface VideoModalProps {
  open: boolean
  onClose: () => void
  title: string
  videoId: string
  startSeconds?: number
  channelUrl: string
}

export default function VideoModal({ open, onClose, title, videoId, startSeconds, channelUrl }: VideoModalProps) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const params = new URLSearchParams({ autoplay: '1', rel: '0' })
  if (startSeconds) params.set('start', String(startSeconds))
  const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`

  return (
    <div className="video-modal-backdrop" onClick={onClose}>
      <div
        className="video-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="video-modal__header">
          <h3>{title}</h3>
          <button type="button" className="video-modal__close" onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <div className="video-modal__frame">
          {/* Only mounted while open, so closing removes the iframe and the video stops. */}
          <iframe
            src={embedSrc}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="video-modal__footer">
          <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
            <PlayIcon />
            Ver entrevista en el canal
          </a>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
