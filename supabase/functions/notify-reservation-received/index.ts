// Se dispara vía Database Webhook (Insert) cada vez que se crea una fila en
// public.reservations — confirma al comprador que su solicitud sí se
// recibió y está en revisión, antes de que llegue la aprobación final
// (notify-ticket) o el rechazo (notify-reservation-rejected).

interface ReservationRow {
  id: string
  event_id: string
  attendee_name: string
  email: string
  amount_paid: number
  created_at: string
}

interface WebhookPayload {
  type: 'INSERT'
  table: string
  record: ReservationRow
}

interface EventRow {
  title: string
  event_date: string | null
  event_time: string | null
  place: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function formatEventDateTime(date: string | null, time: string | null): string {
  if (!date) return 'Fecha por confirmar'
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(year, (month ?? 1) - 1, day ?? 1)
  const dateLabel = d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  if (!time) return dateLabel
  const [hour, minute] = time.split(':').map(Number)
  const t = new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0)
  const timeLabel = t.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${dateLabel} · ${timeLabel}`
}

async function fetchEvent(supabaseUrl: string, serviceRoleKey: string, eventId: string): Promise<EventRow | null> {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/events?id=eq.${eventId}&select=title,event_date,event_time,place`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } },
  )
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
      <p style="margin:2px 0 0;color:#fff;font-size:11px;opacity:0.85;">Solicitud recibida</p>
    </div>
    <div style="padding:28px 24px;">
      <h2 style="margin:0 0 4px;font-size:19px;font-weight:700;color:#221920;">¡Recibimos tu solicitud!</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">${escapeHtml(event.title)}</p>

      <table style="width:100%;border-collapse:collapse;border:1px solid #e4dfe9;border-radius:10px;overflow:hidden;margin:0 0 20px;">
        <tr style="background:#ffffff;">
          <td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b7280;width:96px;">Asistente</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#221920;">${escapeHtml(row.attendee_name)}</td>
        </tr>
        <tr style="background:#faf8fb;">
          <td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b7280;">Fecha</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#221920;">${formatEventDateTime(event.event_date, event.event_time)}</td>
        </tr>
        <tr style="background:#ffffff;">
          <td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b7280;">Lugar</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#221920;">${escapeHtml(event.place || 'Por confirmar')}</td>
        </tr>
      </table>

      <p style="margin:0 0 20px;padding:14px 16px;background:#f5eff7;border-radius:10px;font-size:14px;line-height:1.55;color:#221920;">
        Estamos revisando tu ${row.amount_paid > 0 ? 'comprobante de pago' : 'registro'}. Te avisaremos por este
        mismo correo tan pronto quede aprobada, con tu código de entrada oficial.
      </p>

      <p style="margin:0;font-size:12px;color:#6b7280;text-align:center;">¿Dudas? Escríbenos a <strong>info@fundacionundiamas.org</strong>.</p>
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
      subject: `Recibimos tu solicitud para ${event.title}`,
      html: renderEmail(row, event),
    }),
  })

  if (!res.ok) {
    console.error('Resend API error:', res.status, await res.text())
    return new Response('Failed to send email', { status: 502 })
  }

  return new Response('ok', { status: 200 })
})
