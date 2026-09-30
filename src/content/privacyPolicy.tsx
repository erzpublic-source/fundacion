// Single source of truth for the "Políticas de Privacidad" legal text shown
// in the LegalModal from the Footer (all pages), the Voluntariado form, and
// the Contacto form — updating this file updates the policy everywhere it
// appears.
export const PRIVACY_POLICY_TITLE = 'Políticas de Privacidad'
export const PRIVACY_POLICY_UPDATED_LABEL = 'Última actualización: Septiembre 2026'

export function PrivacyPolicyContent() {
  return (
    <>
      <div>
        <h4>1. Recopilación de datos</h4>
        <p>
          Recopilamos información personal de identificación de nuestros postulantes a voluntarios médicos y de
          salud, incluyendo nombre, especialidad clínica, credenciales profesionales, datos de contacto y hoja de
          vida con el único fin de validar su idoneidad para las brigadas de apoyo psicoeducativo.
        </p>
      </div>
      <div>
        <h4>2. Uso de la información</h4>
        <p>
          La información suministrada se procesa con fines organizativos internos para coordinar el voluntariado
          profesional en la Fundación Un Día Más. No utilizamos sus datos con fines publicitarios de terceros ni
          comerciales.
        </p>
      </div>
      <div>
        <h4>3. Compartir datos con terceros</h4>
        <p>
          Nos comprometemos a no vender, alquilar ni transferir su información personal. Sus credenciales e
          historial solo podrán ser verificados ante los entes certificadores oficiales de salud de acuerdo a las
          regulaciones vigentes de salud mental.
        </p>
      </div>
      <div>
        <h4>4. Derechos del usuario</h4>
        <p>
          Usted mantiene todos sus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición). Podrá retirar su
          consentimiento de voluntariado o solicitar la eliminación total de su hoja de vida escribiéndonos de
          forma directa.
        </p>
      </div>
    </>
  )
}
