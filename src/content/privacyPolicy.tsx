// Single source of truth for the "Políticas de Privacidad" legal text shown
// in the LegalModal from the Footer (all pages), the Voluntariado form, and
// the Contacto form — updating this file updates the policy everywhere it
// appears.
export const PRIVACY_POLICY_TITLE = 'Políticas de Privacidad'
export const PRIVACY_POLICY_UPDATED_LABEL = 'Última actualización: Octubre 2026'

export function PrivacyPolicyContent() {
  return (
    <>
      <div>
        <h4>Ley 1581 de 2012 — Autorización para el Tratamiento de Datos Personales</h4>
        <p>
          En cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto Único
          Reglamentario 1074 de 2015) y demás normas concordantes, autorizo a la FUNDACIÓN UN DÍA MÁS IBAGUE,
          identificada con NIT 901892183-4, con domicilio en Ibagué, Tolima, Colombia, correo electrónico{' '}
          <a href="mailto:fundacionundiamasibague@gmail.com">fundacionundiamasibague@gmail.com</a> y teléfono{' '}
          <a href="tel:+573004771699">+57 3004771699</a> (en adelante, la "Fundación"), en calidad de Responsable
          del tratamiento, para recolectar, almacenar, usar, circular y suprimir mis datos personales (nombre,
          correo electrónico, teléfono, ciudad y el contenido de mi mensaje).
        </p>
      </div>
      <div>
        <h4>Finalidades del Tratamiento</h4>
        <p>La Fundación tratará mis datos personales para:</p>
        <ul>
          <li>
            Atender y dar respuesta a mis consultas, solicitudes de orientación, acompañamiento o peticiones
            realizadas a través de los canales de contacto y servicios comunitarios.
          </li>
          <li>
            Contactarme vía correo electrónico, llamada telefónica, SMS o WhatsApp en relación directa con mi
            solicitud o proceso de atención.
          </li>
          <li>
            Enviarme información relevante sobre iniciativas de bienestar emocional, prevención, actividades,
            talleres, novedades y programas de la Fundación (permiso que puedo revocar en cualquier momento).
          </li>
          <li>
            Realizar estudios internos, evaluaciones y análisis estadísticos orientados a mejorar la calidad del
            servicio, la experiencia en la plataforma y el impacto social de la Fundación.
          </li>
          <li>Cumplir con las obligaciones legales, contables, administrativas y regulatorias vigentes en Colombia.</li>
        </ul>
      </div>
      <div>
        <h4>Derechos del Titular</h4>
        <p>Como titular de la información, tengo derecho a:</p>
        <ul>
          <li>Conocer, actualizar y rectificar mis datos personales frente a la Fundación.</li>
          <li>Solicitar prueba de la autorización otorgada para el tratamiento.</li>
          <li>Ser informado, previa solicitud, respecto del uso que se le ha dado a mis datos.</li>
          <li>
            Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a lo dispuesto
            en la normativa vigente.
          </li>
          <li>
            Revocar la autorización y/o solicitar la supresión de mis datos cuando en el tratamiento no se
            respeten los principios, derechos y garantías constitucionales y legales.
          </li>
          <li>Acceder de forma gratuita a mis datos personales que hayan sido objeto de tratamiento.</li>
        </ul>
      </div>
      <div>
        <h4>Datos Sensibles y Menores de Edad</h4>
        <p>
          El suministro de datos sensibles es de carácter facultativo y voluntario; ninguna pregunta sobre este
          tipo de datos es de respuesta obligatoria. En relación con el tratamiento de datos personales de niñas,
          niños y adolescentes, se garantizará siempre el respeto por sus derechos prevalentes y el interés
          superior del menor, requiriendo en todo caso la autorización previa y expresa de sus padres o
          representantes legales.
        </p>
      </div>
      <div>
        <h4>Canales para el Ejercicio de Derechos</h4>
        <p>
          Para ejercer mis derechos de consulta, actualización, rectificación o supresión, podré comunicarme al
          correo electrónico <a href="mailto:fundacionundiamasibague@gmail.com">fundacionundiamasibague@gmail.com</a>{' '}
          o a la línea telefónica <a href="tel:+573004771699">+57 3004771699</a>. De conformidad con la ley, las
          consultas serán atendidas en un término máximo de diez (10) días hábiles y los reclamos en un término
          máximo de quince (15) días hábiles, contados a partir de la fecha de su recibo.
        </p>
      </div>
      <div>
        <h4>Vigencia</h4>
        <p>
          Los datos personales proporcionados se conservarán durante el tiempo que sea razonable y necesario para
          cumplir con las finalidades que justificaron su recolección, o mientras subsista una obligación legal o
          contractual que exija su conservación.
        </p>
      </div>
    </>
  )
}
