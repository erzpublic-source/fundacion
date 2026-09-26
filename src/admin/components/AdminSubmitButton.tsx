interface AdminSubmitButtonProps {
  loading: boolean
  disabled?: boolean
  idleLabel: string
  loadingLabel: string
}

// Shared by every admin auth form ("Ingresar", "Enviar enlace",
// "Restablecer contraseña") so the loading/disabled behavior — and the
// guarantee against double-submits — stays identical across all three.
export default function AdminSubmitButton({ loading, disabled, idleLabel, loadingLabel }: AdminSubmitButtonProps) {
  const isDisabled = loading || disabled

  return (
    <button
      type="submit"
      className={`btn btn--primary admin-submit${loading ? ' admin-submit--loading' : ''}`}
      disabled={isDisabled}
      aria-busy={loading}
    >
      {loading && <span className="admin-submit__spinner" aria-hidden="true" />}
      {loading ? loadingLabel : idleLabel}
    </button>
  )
}
