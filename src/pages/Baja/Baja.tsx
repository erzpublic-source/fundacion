import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './Baja.css'

function CheckCircleIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#25b46a" strokeWidth="1.7" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.5l2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e0455a" strokeWidth="1.7" aria-hidden="true">
      <path d="M12 3 22 20H2L12 3Z" strokeLinejoin="round" />
      <path d="M12 9.5v4.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.9" fill="#e0455a" stroke="none" />
    </svg>
  )
}

const CONTENT = {
  ok: {
    icon: <CheckCircleIcon />,
    title: 'Listo, te diste de baja',
    text: 'No volverás a recibir correos de invitación a eventos ni novedades de la Fundación Un Día Más.',
  },
  invalid: {
    icon: <WarningIcon />,
    title: 'Enlace inválido',
    text: 'Este enlace de baja no es válido o ya expiró.',
  },
  error: {
    icon: <WarningIcon />,
    title: 'Algo salió mal',
    text: 'No pudimos procesar tu solicitud en este momento. Intenta de nuevo más tarde.',
  },
} as const

type BajaStatus = keyof typeof CONTENT

export default function Baja() {
  const [searchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  const status: BajaStatus = statusParam === 'invalid' || statusParam === 'error' ? statusParam : 'ok'
  const content = CONTENT[status]

  return (
    <>
      <Navbar />
      <main className="baja-page">
        <div className="baja-card">
          {content.icon}
          <h1>{content.title}</h1>
          <p>{content.text}</p>
          <Link to="/" className="btn btn--primary">
            Volver al inicio
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
