import { useEffect } from 'react'
import './Toast.css'

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1.2l1.9 4.1 4.4.5-3.3 3 .9 4.3L8 11l-3.9 2.1.9-4.3-3.3-3 4.4-.5L8 1.2Z" />
    </svg>
  )
}

interface ToastProps {
  message: string
  onDismiss: () => void
}

// Simple local-state toast (no context needed yet — GestionEventos is its
// only consumer). Auto-dismisses so the admin doesn't have to close it by hand.
export default function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, 3200)
    return () => window.clearTimeout(id)
  }, [onDismiss])

  return (
    <div className="admin-toast" role="status">
      <span className="admin-toast__icon" aria-hidden="true">
        <StarIcon />
      </span>
      {message}
    </div>
  )
}
