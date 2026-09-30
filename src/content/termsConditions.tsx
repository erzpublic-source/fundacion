// Single source of truth for the "Términos y Condiciones" legal text shown
// in the LegalModal from the Voluntariado form — updating this file updates
// the terms everywhere they appear.
export const TERMS_CONDITIONS_TITLE = 'Términos y Condiciones'
export const TERMS_CONDITIONS_UPDATED_LABEL = 'Última actualización: Septiembre 2026'

export function TermsConditionsContent() {
  return (
    <>
      <div>
        <h4>1. Naturaleza del voluntariado</h4>
        <p>
          La vinculación como voluntario profesional en la Fundación Un Día Más es de carácter altruista, no
          remunerado y no genera ningún tipo de relación laboral, contractual ni de subordinación con la
          Fundación. Su participación se limita a las actividades y brigadas de apoyo psicoeducativo para las que
          sea convocado.
        </p>
      </div>
      <div>
        <h4>2. Idoneidad y verificación de credenciales</h4>
        <p>
          Al postularse, usted declara que la información profesional suministrada (especialidad clínica,
          credenciales y hoja de vida) es veraz y verificable. La Fundación se reserva el derecho de validar dicha
          idoneidad ante los entes certificadores de salud correspondientes y de rechazar o dar de baja cualquier
          postulación que no cumpla los requisitos del programa.
        </p>
      </div>
      <div>
        <h4>3. Confidencialidad y ética profesional</h4>
        <p>
          Toda información de beneficiarios a la que tenga acceso durante su labor voluntaria (historias,
          sesiones, datos personales o clínicos) es estrictamente confidencial y debe tratarse conforme a la ética
          profesional de su especialidad y a la normativa vigente de salud mental. Esta obligación de
          confidencialidad permanece vigente aun después de finalizada su colaboración.
        </p>
      </div>
      <div>
        <h4>4. Vigencia y terminación</h4>
        <p>
          Usted puede retirarse del programa de voluntariado en cualquier momento, notificándolo a la Fundación.
          De igual forma, la Fundación podrá dar por terminada la colaboración cuando lo considere necesario para
          el bienestar de los beneficiarios o el cumplimiento de sus protocolos de atención.
        </p>
      </div>
    </>
  )
}
