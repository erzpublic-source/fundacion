import logo from '../../assets/logo.svg'

interface LogoProps {
  className?: string
}

export default function Logo({ className }: LogoProps) {
  return <img src={logo} alt="Fundación Un Día Más" className={className} style={{ height: 28, width: 'auto' }} />
}
