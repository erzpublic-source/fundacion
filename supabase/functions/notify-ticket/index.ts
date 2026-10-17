interface ReservationRow {
  id: string
  event_id: string
  attendee_name: string
  email: string
  amount_paid: number
  status: 'pendiente' | 'aprobado' | 'rechazado'
  ticket_code: string | null
  discount_code: string | null
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
  event_date: string | null
  event_time: string | null
  place: string
  price: number | null
}

interface DiscountCodeRow {
  kind: 'percent' | 'fixed' | 'free'
  value: number
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function formatCOP(value: number): string {
  return `$${value.toLocaleString('es-CO')} COP`
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

async function fetchEvent(
  supabaseUrl: string,
  serviceRoleKey: string,
  eventId: string,
): Promise<EventRow | null> {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/events?id=eq.${eventId}&select=title,event_date,event_time,place,price`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } },
  )
  if (!res.ok) return null
  const rows = (await res.json()) as EventRow[]
  return rows[0] ?? null
}

async function fetchDiscountCode(
  supabaseUrl: string,
  serviceRoleKey: string,
  eventId: string,
  code: string,
): Promise<DiscountCodeRow | null> {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/discount_codes?event_id=eq.${eventId}&code=eq.${encodeURIComponent(code)}&select=kind,value`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } },
  )
  if (!res.ok) return null
  const rows = (await res.json()) as DiscountCodeRow[]
  return rows[0] ?? null
}

function renderEmail(
  row: ReservationRow,
  event: EventRow,
  discount: DiscountCodeRow | null,
): string {
  const isFreeEvent = !event.price || event.price === 0
  const subtotal = event.price ?? 0
  const total = row.amount_paid
  const discountAmount = Math.max(0, subtotal - total)

  const badge = isFreeEvent
    ? `<div style="text-align:center;margin:0 0 20px;">
        <span style="display:inline-block;background:#e8f6ee;color:#1a7a44;font-weight:700;font-size:12px;padding:6px 14px;border-radius:999px;">Entrada gratuita</span>
      </div>`
    : ''

  const priceBreakdown =
    !isFreeEvent
      ? `<table style="width:100%;border-collapse:collapse;margin:0 0 20px;">
          <tr>
            <td style="padding:4px 0;font-size:14px;color:#6b7280;">Subtotal</td>
            <td style="padding:4px 0;font-size:14px;color:#221920;text-align:right;">${formatCOP(subtotal)}</td>
          </tr>
          ${
            discountAmount > 0
              ? `<tr>
                  <td style="padding:4px 0;font-size:14px;color:#6b7280;">Descuento${row.discount_code ? ` (${escapeHtml(row.discount_code)})` : ''}${discount && discount.kind === 'percent' ? ` — ${discount.value}%` : ''}</td>
                  <td style="padding:4px 0;font-size:14px;color:#1a7a44;text-align:right;">−${formatCOP(discountAmount)}</td>
                </tr>`
              : ''
          }
          <tr>
            <td style="padding:10px 0 0;font-size:15px;font-weight:700;color:#221920;border-top:1px solid #e4dfe9;">Total pagado</td>
            <td style="padding:10px 0 0;font-size:15px;font-weight:700;color:#221920;text-align:right;border-top:1px solid #e4dfe9;">${formatCOP(total)}</td>
          </tr>
        </table>`
      : ''

  return `
<div style="font-family:'Quicksand',Arial,sans-serif;background:#f6f3f8;padding:32px 16px;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e4dfe9;">
    <div style="background:linear-gradient(90deg,#6a5390 0%,#d4679a 100%);padding:22px 24px;">
      <p style="margin:0;color:#fff;font-size:14px;font-weight:700;">Fundación Un Día Más</p>
      <p style="margin:2px 0 0;color:#fff;font-size:11px;opacity:0.85;">Confirmación de entrada</p>
    </div>
    <div style="padding:28px 24px;">
      <h2 style="margin:0 0 4px;font-size:19px;font-weight:700;color:#221920;">¡Tu entrada está confirmada!</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">${escapeHtml(event.title)}</p>

      ${badge}

      <div style="border:1px dashed #c9bedd;border-radius:12px;padding:18px 20px;margin:0 0 20px;background:#faf8fb;">
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#67518d;">Asistente</p>
        <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#221920;">${escapeHtml(row.attendee_name)}</p>
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#67518d;">Código de entrada</p>
        <p style="margin:0;font-size:20px;font-weight:700;letter-spacing:1px;color:#d4679a;">${escapeHtml(row.ticket_code ?? '')}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;border:1px solid #e4dfe9;border-radius:10px;overflow:hidden;margin:0 0 20px;">
        <tr style="background:#ffffff;">
          <td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b7280;width:96px;">Fecha</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#221920;">${formatEventDateTime(event.event_date, event.event_time)}</td>
        </tr>
        <tr style="background:#faf8fb;">
          <td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b7280;">Lugar</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:600;color:#221920;">${escapeHtml(event.place || 'Por confirmar')}</td>
        </tr>
      </table>

      ${priceBreakdown}

      <p style="margin:0;font-size:12px;color:#6b7280;text-align:center;">Presenta este código el día del evento. Si tienes dudas escríbenos a <strong>info@fundacionundiamas.org</strong>.</p>
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

  // Solo nos interesa el instante en que la reserva PASA a aprobado con su
  // código de entrada ya asignado — cualquier otra actualización (rechazar,
  // deshacer un rechazo, etc.) no debe reenviar el correo.
  const justApproved = row.status === 'aprobado' && Boolean(row.ticket_code) && previous?.status !== 'aprobado'
  if (!justApproved) {
    return new Response('skipped', { status: 200 })
  }

  const event = await fetchEvent(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, row.event_id)
  if (!event) {
    console.error('Event not found for reservation', row.id, row.event_id)
    return new Response('Event not found', { status: 404 })
  }

  const discount = row.discount_code
    ? await fetchDiscountCode(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, row.event_id, row.discount_code)
    : null

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Fundación Un Día Más <notificaciones@fundacionundiamas.org>',
      to: [row.email],
      subject: `Tu entrada para ${event.title} está confirmada`,
      html: renderEmail(row, event, discount),
    }),
  })

  if (!res.ok) {
    console.error('Resend API error:', res.status, await res.text())
    return new Response('Failed to send email', { status: 502 })
  }

  return new Response('ok', { status: 200 })
})
