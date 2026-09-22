import logo from '../../assets/logo.svg'

interface LogoProps {
  className?: string
}

export default function Logo({ className }: LogoProps) {
  return <img src={logo} alt="Fundación Un Día Más" className={`logo-img${className ? ` ${className}` : ''}`} />
}
