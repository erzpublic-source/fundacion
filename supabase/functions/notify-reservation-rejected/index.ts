// Se dispara vía Database Webhook (Update) sobre public.reservations —
// envía al comprador el motivo cuando su solicitud es rechazada por el admin.

interface ReservationRow {
  id: string
  event_id: string
  attendee_name: string
  email: string
  status: 'pendiente' | 'aprobado' | 'rechazado'
  rejection_reason: string | null
  created_at: string
}

interface WebhookPayload {
  type: 'UPDATE'
  table: string
  record: ReservationRow
  old_record: ReservationRow
}

interface EventRow {
  title: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function fetchEvent(supabaseUrl: string, serviceRoleKey: string, eventId: string): Promise<EventRow | null> {
  const res = await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${eventId}&select=title`, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
  })
  if (!res.ok) return null
  const rows = (await res.json()) as EventRow[]
  return rows[0] ?? null
}

function renderEmail(row: ReservationRow, event: EventRow): string {
  return `
<div style="font-family:'Quicksand',Arial,sans-serif;background:#f6f3f8;padding:32px 16px;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e4dfe9;">
    <div style="background:linear-gradient(90deg,#6a5390 0%,#d4679a 100%);padding:22px 24px;">
      <p style="margin:0;color:#fff;font-size:14px;font-weight:700;">Fundación Un Día Más</p>
      <p style="margin:2px 0 0;color:#fff;font-size:11px;opacity:0.85;">Actualización de tu solicitud</p>
    </div>
    <div style="padding:28px 24px;">
      <h2 style="margin:0 0 4px;font-size:19px;font-weight:700;color:#221920;">No pudimos aprobar tu solicitud</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">${escapeHtml(event.title)}</p>

      <table style="width:100%;border-collapse:collapse;border:1px solid #e4dfe9;border-radius:10px;overflow:hidden;margin:0 0 20px;">
        <tr style="background:#ffffff;">
          <td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b7280;width:96px;">Asistente</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#221920;">${escapeHtml(row.attendee_name)}</td>
        </tr>
      </table>

      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#67518d;">Motivo</p>
      <p style="margin:0 0 20px;padding:14px 16px;background:#fdf4f6;border-radius:10px;font-size:14px;line-height:1.55;color:#221920;">
        ${escapeHtml(row.rejection_reason ?? 'No especificado')}
      </p>

      <p style="margin:0;font-size:12px;color:#6b7280;text-align:center;">Si crees que esto es un error, escríbenos a <strong>info@fundacionundiamas.org</strong> y lo revisamos contigo.</p>
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
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing RESEND_API_KEY, SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY secret')
    return new Response('Server misconfigured', { status: 500 })
  }

  const payload = (await req.json()) as WebhookPayload
  const row = payload.record
  const previous = payload.old_record

  // Solo cuando la reserva PASA a rechazado — evita reenviar el correo si
  // algo más se actualiza en una fila que ya estaba rechazada.
  const justRejected = row.status === 'rechazado' && previous?.status !== 'rechazado'
  if (!justRejected) {
    return new Response('skipped', { status: 200 })
  }

  const event = await fetchEvent(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, row.event_id)
  if (!event) {
    console.error('Event not found for reservation', row.id, row.event_id)
    return new Response('Event not found', { status: 404 })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Fundación Un Día Más <notificaciones@fundacionundiamas.org>',
      to: [row.email],
      subject: `Novedad con tu solicitud para ${event.title}`,
      html: renderEmail(row, event),
    }),
  })

  if (!res.ok) {
    console.error('Resend API error:', res.status, await res.text())
    return new Response('Failed to send email', { status: 502 })
  }

  return new Response('ok', { status: 200 })
})
