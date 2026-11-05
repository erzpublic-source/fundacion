// Envía la invitación/noticia que el admin arma en Contactos → Nueva
// invitación a todos los contactos activos de mailing_contacts, uno por
// uno (cada correo necesita su propio link de baja, así que no se puede
// mandar como un solo envío con varios destinatarios).
//
// A diferencia de submit-*, esta función SÍ requiere "Verify JWT" activo
// en Settings — solo el admin autenticado del panel puede dispararla, no
// es un endpoint público.
//
// Secrets que necesita este proyecto (ya existen RESEND_API_KEY,
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — nada nuevo que agregar).

interface RequestBody {
  title: string
  message: string
  imageUrl: string | null
  ctaUrl: string | null
  ctaLabel: string | null
}

interface MailingContactRow {
  id: string
  nombre: string
  correo: string
  unsubscribe_token: string
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderEmail(
  contact: MailingContactRow,
  body: RequestBody,
  supabaseUrl: string,
): string {
  const imageBlock = body.imageUrl
    ? `<img src="${body.imageUrl}" alt="" style="width:100%;height:auto;display:block;" />`
    : ''

  const ctaBlock =
    body.ctaUrl && body.ctaLabel
      ? `<a href="${body.ctaUrl}" style="display:block;text-align:center;margin:0 0 8px;padding:13px 20px;border-radius:999px;background:#67518d;color:#fff;font-size:14px;font-weight:700;text-decoration:none;">${escapeHtml(body.ctaLabel)}</a>`
      : ''

  const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe-contact?token=${contact.unsubscribe_token}`

  return `
<div style="font-family:'Quicksand',Arial,sans-serif;background:#f6f3f8;padding:32px 16px;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e4dfe9;">
    <div style="background:linear-gradient(90deg,#6a5390 0%,#d4679a 100%);padding:22px 24px;">
      <p style="margin:0;color:#fff;font-size:14px;font-weight:700;">Fundación Un Día Más</p>
    </div>
    ${imageBlock}
    <div style="padding:28px 24px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#67518d;">Invitación</p>
      <h2 style="margin:0 0 18px;font-size:19px;font-weight:700;color:#221920;">${escapeHtml(body.title)}</h2>
      <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#221920;white-space:pre-wrap;">${escapeHtml(body.message)}</p>
      ${ctaBlock}
    </div>
    <div style="padding:16px 24px 22px;border-top:1px solid #e4dfe9;">
      <p style="margin:0 0 4px;font-size:11px;color:#6b7280;">Fundación Un Día Más · fundacionundiamas.org</p>
      <p style="margin:0;font-size:11px;color:#6b7280;">Recibiste este correo porque aceptaste recibir información de eventos y novedades de la Fundación. <a href="${unsubscribeUrl}" style="color:#6b7280;">Darte de baja</a>.</p>
    </div>
  </div>
</div>`
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })
  if (req.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405)

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or RESEND_API_KEY secret')
    return jsonResponse({ error: 'server_misconfigured' }, 500)
  }

  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return jsonResponse({ error: 'invalid_body' }, 400)
  }

  if (!body.title?.trim() || !body.message?.trim()) {
    return jsonResponse({ error: 'missing_fields' }, 400)
  }

  const contactsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/mailing_contacts?active=eq.true&select=id,nombre,correo,unsubscribe_token`,
    { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } },
  )
  if (!contactsRes.ok) {
    console.error('Failed to load contacts:', contactsRes.status, await contactsRes.text())
    return jsonResponse({ error: 'contacts_fetch_failed' }, 502)
  }
  const contacts = (await contactsRes.json()) as MailingContactRow[]

  let sent = 0
  let failed = 0

  // Secuencial, no Promise.all — para no ráfagar la API de Resend de golpe
  // con listas más grandes a futuro.
  for (const contact of contacts) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Fundación Un Día Más <notificaciones@fundacionundiamas.org>',
        to: [contact.correo],
        subject: body.title,
        html: renderEmail(contact, body, SUPABASE_URL),
      }),
    })
    if (res.ok) {
      sent += 1
    } else {
      failed += 1
      console.error('Send failed for', contact.correo, res.status, await res.text())
    }
  }

  return jsonResponse({ ok: true, sent, failed, total: contacts.length }, 200)
})
