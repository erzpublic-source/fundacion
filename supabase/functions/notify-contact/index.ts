// Edge Function: notify-contact
// Se dispara vía Database Webhook cada vez que se inserta una fila en
// public.contact_messages, y envía una notificación por correo al admin
// a través de Resend. No depende de Supabase Storage ni de datos sensibles
// adicionales — todo el mensaje va en el cuerpo del correo.
//
// Secrets que necesita este proyecto (Project Settings → Edge Functions →
// Secrets, o Edge Functions → notify-contact → Secrets):
//   RESEND_API_KEY   — la API key de Resend (empieza con re_...)
//   ADMIN_EMAIL      — correo que recibe la notificación (ej. dirfundamascol@gmail.com)

interface ContactMessageRow {
  id: string
  nombre: string
  correo: string
  asunto: string
  mensaje: string
  created_at: string
}

interface WebhookPayload {
  type: 'INSERT'
  table: string
  record: ContactMessageRow
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderEmail(row: ContactMessageRow): string {
  const fecha = new Date(row.created_at).toLocaleString('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Bogota',
  })

  return `
<div style="font-family:'Quicksand',Arial,sans-serif;background:#f6f3f8;padding:32px 16px;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e4dfe9;">
    <div style="background:linear-gradient(90deg,#6a5390 0%,#d4679a 100%);padding:22px 24px;">
      <p style="margin:0;color:#fff;font-size:14px;font-weight:700;">Fundación Un Día Más</p>
      <p style="margin:2px 0 0;color:#fff;font-size:11px;opacity:0.85;">Notificación automática</p>
    </div>
    <div style="padding:28px 24px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#67518d;">Formulario de Contacto</p>
      <h2 style="margin:0 0 18px;font-size:19px;font-weight:700;color:#221920;">Tienes un nuevo mensaje</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e4dfe9;border-radius:10px;overflow:hidden;margin:0 0 18px;">
        <tr style="background:#ffffff;">
          <td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b7280;width:96px;">Nombre</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#221920;">${escapeHtml(row.nombre)}</td>
        </tr>
        <tr style="background:#faf8fb;">
          <td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b7280;">Correo</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#221920;">${escapeHtml(row.correo)}</td>
        </tr>
        <tr style="background:#ffffff;">
          <td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b7280;">Asunto</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#221920;">${escapeHtml(row.asunto)}</td>
        </tr>
        <tr style="background:#faf8fb;">
          <td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b7280;">Recibido</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#221920;">${fecha}</td>
        </tr>
      </table>
      <p style="margin:0 0 20px;padding:14px 16px;background:#f5eff7;border-radius:10px;font-size:14px;line-height:1.55;color:#221920;">${escapeHtml(row.mensaje)}</p>
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

  if (!RESEND_API_KEY || !ADMIN_EMAIL) {
    console.error('Missing RESEND_API_KEY or ADMIN_EMAIL secret')
    return new Response('Server misconfigured', { status: 500 })
  }

  const payload = (await req.json()) as WebhookPayload
  const row = payload.record

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
      subject: `Nuevo mensaje de contacto — ${row.nombre}`,
      html: renderEmail(row),
    }),
  })

  if (!res.ok) {
    console.error('Resend API error:', res.status, await res.text())
    return new Response('Failed to send email', { status: 502 })
  }

  return new Response('ok', { status: 200 })
})
