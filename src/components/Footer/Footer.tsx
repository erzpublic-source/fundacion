import Logo from '../Navbar/Logo'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer" id="contacto">
      <div className="footer__content">
        <div className="footer__brand">
          <Logo />
          <p>Unidos por la salud mental y el bienestar emocional de nuestra comunidad.</p>
        </div>

        <div className="footer__col">
          <p className="footer__heading">Enlaces</p>
          <ul>
            <li>
              <a href="#nosotros">Nosotros</a>
            </li>
            <li>
              <a href="#historias">Historias</a>
            </li>
            <li>
              <a href="#voluntariado">Voluntariado</a>
            </li>
            <li>
              <a href="#privacidad">Privacidad</a>
            </li>
            <li>
              <a href="#terminos">Términos</a>
            </li>
          </ul>
        </div>

        <div className="footer__col">
          <p className="footer__heading">Contacto</p>
          <ul>
            <li>
              <a href="mailto:info@fundacionundiamas.org">info@fundacionundiamas.org</a>
            </li>
            <li>
              <a href="tel:+573000000000">+57 300 000 0000</a>
            </li>
          </ul>
        </div>

        <div className="footer__col">
          <p className="footer__heading">Síguenos</p>
          <div className="footer__social">
            <a href="#" aria-label="Facebook" className="footer__social-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
              </svg>
            </a>
            <a href="#" aria-label="YouTube" className="footer__social-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.5 7.2a3 3 0 0 0-2.1-2.1C19.5 4.6 12 4.6 12 4.6s-7.5 0-9.4.5A3 3 0 0 0 .5 7.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-4.8ZM9.6 15.5V8.5L15.8 12l-6.2 3.5Z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="footer__social-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2c-2.7 0-3.1 0-4.1.1-1.1 0-1.8.2-2.4.5a4.9 4.9 0 0 0-1.8 1.1A4.9 4.9 0 0 0 2.6 5.5c-.3.6-.5 1.3-.5 2.4C2 8.9 2 9.3 2 12s0 3.1.1 4.1c0 1.1.2 1.8.5 2.4a4.9 4.9 0 0 0 1.1 1.8 4.9 4.9 0 0 0 1.8 1.1c.6.3 1.3.5 2.4.5C8.9 22 9.3 22 12 22s3.1 0 4.1-.1c1.1 0 1.8-.2 2.4-.5a4.9 4.9 0 0 0 1.8-1.1 4.9 4.9 0 0 0 1.1-1.8c.3-.6.5-1.3.5-2.4.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1c0-1.1-.2-1.8-.5-2.4a4.9 4.9 0 0 0-1.1-1.8 4.9 4.9 0 0 0-1.8-1.1c-.6-.3-1.3-.5-2.4-.5C15.1 2 14.7 2 12 2Zm0 1.8c2.7 0 3 0 4 .1.9 0 1.5.2 1.8.3.5.2.8.4 1.1.7.3.3.5.6.7 1.1.2.3.3.9.3 1.8.1 1 .1 1.3.1 4s0 3-.1 4c0 .9-.2 1.5-.3 1.8-.2.5-.4.8-.7 1.1-.3.3-.6.5-1.1.7-.3.2-.9.3-1.8.3-1 .1-1.3.1-4 .1s-3 0-4-.1c-.9 0-1.5-.2-1.8-.3a3 3 0 0 1-1.1-.7 3 3 0 0 1-.7-1.1c-.2-.3-.3-.9-.3-1.8-.1-1-.1-1.3-.1-4s0-3 .1-4c0-.9.2-1.5.3-1.8.2-.5.4-.8.7-1.1.3-.3.6-.5 1.1-.7.3-.2.9-.3 1.8-.3 1-.1 1.3-.1 4-.1Zm0 3.1a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2Zm0 8.4a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6Zm5.3-8.6a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© 2026 Fundación Un Día Más. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
