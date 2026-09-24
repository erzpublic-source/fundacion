import { useId, useState } from 'react'

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M1 10s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6Z" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.6" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M1 10s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6Z" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.6" />
      <path d="M2.5 2.5l15 15" strokeLinecap="round" />
    </svg>
  )
}

interface PasswordFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  error?: string
  disabled?: boolean
}

export default function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete = 'current-password',
  error,
  disabled,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="admin-field">
      <label htmlFor={id}>{label}</label>
      <div className={`admin-field__control${error ? ' admin-field__control--error' : ''}`}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        <button
          type="button"
          className="admin-field__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <p className="admin-field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
