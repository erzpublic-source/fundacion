interface VolunteerApplicationRow {
  id: string
  nombre: string
  especialidad: string
  ciudad: string
  celular: string
  correo: string
  cv_url: string
  created_at: string
}

interface WebhookPayload {
  type: 'INSERT'
  table: string
  record: VolunteerApplicationRow
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function createSignedCvUrl(
  supabaseUrl: string,
  serviceRoleKey: string,
  path: string,
): Promise<string | null> {
  const res = await fetch(
    `${supabaseUrl}/storage/v1/object/sign/volunteer-cvs/${path}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: 60 * 60 * 72 }), // 72 horas
    },
  )

  if (!res.ok) {
    console.error('Failed to sign CV url:', res.status, await res.text())
    return null
  }

  const data = (await res.json()) as { signedURL: string }
  return `${supabaseUrl}/storage/v1${data.signedURL}`
}

function renderEmail(row: VolunteerApplicationRow, cvUrl: string | null): string {
  const fecha = new Date(row.created_at).toLocaleString('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Bogota',
  })

  const cvButton = cvUrl
    ? `<div style="text-align:center;margin:0 0 20px;">
        <a href="${cvUrl}" style="display:inline-block;background:linear-gradient(90deg,#6a5390 0%,#d4679a 100%);color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:999px;">Descargar hoja de vida (PDF)</a>
      </div>
      <p style="margin:0 0 20px;font-size:11px;color:#9ca3af;text-align:center;">Este enlace expira en 72 horas.</p>`
    : `<p style="margin:0 0 20px;padding:14px 16px;background:#fdf1f1;border-radius:10px;font-size:13px;color:#b42318;">No se pudo generar el enlace de descarga. Revisa el archivo directamente en Supabase Storage.</p>`

  return `
<div style="font-family:'Quicksand',Arial,sans-serif;background:#f6f3f8;padding:32px 16px;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e4dfe9;">
    <div style="background:linear-gradient(90deg,#6a5390 0%,#d4679a 100%);padding:22px 24px;">
      <p style="margin:0;color:#fff;font-size:14px;font-weight:700;">Fundación Un Día Más</p>
      <p style="margin:2px 0 0;color:#fff;font-size:11px;opacity:0.85;">Notificación automática</p>
    </div>
    <div style="padding:28px 24px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#67518d;">Postulación de Voluntariado</p>
      <h2 style="margin:0 0 18px;font-size:19px;font-weight:700;color:#221920;">Nueva postulación recibida</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e4dfe9;border-radius:10px;overflow:hidden;margin:0 0 18px;">
        <tr style="background:#ffffff;">
          <td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b7280;width:110px;">Nombre</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#221920;">${escapeHtml(row.nombre)}</td>
        </tr>
        <tr style="background:#faf8fb;">
          <td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b7280;">Especialidad</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#221920;">${escapeHtml(row.especialidad)}</td>
        </tr>
        <tr style="background:#ffffff;">
          <td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b7280;">Ciudad</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#221920;">${escapeHtml(row.ciudad)}</td>
        </tr>
        <tr style="background:#faf8fb;">
          <td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b7280;">Celular</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#221920;">${escapeHtml(row.celular)}</td>
        </tr>
        <tr style="background:#ffffff;">
          <td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b7280;">Correo</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#221920;">${escapeHtml(row.correo)}</td>
        </tr>
        <tr style="background:#faf8fb;">
          <td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b7280;">Recibido</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#221920;">${fecha}</td>
        </tr>
      </table>
      ${cvButton}
      <p style="margin:0;font-size:12px;color:#6b7280;text-align:center;">Puedes responder directo a este correo a <strong>${escapeHtml(row.correo)}</strong>.</p>
    </div>
    <div style="padding:16px 24px 22px;border-top:1px solid #e4dfe9;">
      <p style="margin:0;font-size:11px;color:#6b7280;">Fundación Un Día Más · fundacionundiamas.org</p>
    </div>
  </div>
</div>`
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!RESEND_API_KEY || !ADMIN_EMAIL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing RESEND_API_KEY, ADMIN_EMAIL, SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY secret')
    return new Response('Server misconfigured', { status: 500 })
  }

  const payload = (await req.json()) as WebhookPayload
  const row = payload.record

  const cvUrl = await createSignedCvUrl(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, row.cv_url)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Fundación Un Día Más <notificaciones@fundacionundiamas.org>',
      to: [ADMIN_EMAIL],
      reply_to: row.correo,
      subject: `Nueva postulación de voluntariado — ${row.nombre}`,
      html: renderEmail(row, cvUrl),
    }),
  })

  if (!res.ok) {
    console.error('Resend API error:', res.status, await res.text())
    return new Response('Failed to send email', { status: 502 })
  }

  return new Response('ok', { status: 200 })
})
