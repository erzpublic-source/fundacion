// Recibe la reserva de un evento y verifica el token de reCAPTCHA contra la
// API de Google ANTES de insertar las filas. El comprobante de pago sigue
// subiéndose directo desde el navegador al bucket privado (ya protegido
// por su propia política de Storage); esta función gatekeepea las filas de
// `reservations` y consume el código de descuento si se usó uno.
//
// Secret nuevo que necesita este proyecto (Edge Functions → Secrets):
//   RECAPTCHA_SECRET_KEY — la "Secret key" del sitio en
//     https://www.google.com/recaptcha/admin (NO la site key pública que
//     ya está en el frontend)

interface RequestBody {
  eventId: string
  attendeeNames: string[]
  email: string
  amountPerAttendee: number
  receiptPath: string | null
  discountCode: string | null
  recaptchaToken: string
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

async function verifyRecaptcha(secret: string, token: string): Promise<boolean> {
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  })
  if (!res.ok) return false
  const data = (await res.json()) as { success: boolean }
  return data.success === true
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })
  if (req.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405)

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const RECAPTCHA_SECRET_KEY = Deno.env.get('RECAPTCHA_SECRET_KEY')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RECAPTCHA_SECRET_KEY) {
    console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or RECAPTCHA_SECRET_KEY secret')
    return jsonResponse({ error: 'server_misconfigured' }, 500)
  }

  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return jsonResponse({ error: 'invalid_body' }, 400)
  }

  const { eventId, attendeeNames, email, amountPerAttendee, receiptPath, discountCode, recaptchaToken } = body
  if (!eventId || !Array.isArray(attendeeNames) || attendeeNames.length === 0 || !email?.trim() || !recaptchaToken) {
    return jsonResponse({ error: 'missing_fields' }, 400)
  }

  const captchaOk = await verifyRecaptcha(RECAPTCHA_SECRET_KEY, recaptchaToken)
  if (!captchaOk) {
    return jsonResponse({ error: 'captcha_failed' }, 400)
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/reservations`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(
      attendeeNames.map((attendeeName) => ({
        event_id: eventId,
        attendee_name: attendeeName,
        email: email.trim(),
        amount_paid: amountPerAttendee,
        status: 'pendiente',
        receipt_url: receiptPath,
        discount_code: discountCode,
      })),
    ),
  })

  if (!res.ok) {
    console.error('Insert error:', res.status, await res.text())
    return jsonResponse({ error: 'insert_failed' }, 502)
  }

  if (discountCode) {
    // Best-effort: la reserva ya quedó creada, así que un fallo aquí (p.
    // ej. el código se agotó justo en este instante) no debe bloquear al
    // comprador — el admin puede revisarlo manualmente si hace falta.
    const redeemRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/redeem_discount_code`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_event_id: eventId, p_code: discountCode }),
    })
    if (!redeemRes.ok) {
      console.error('Redeem discount code failed:', redeemRes.status, await redeemRes.text())
    }
  }

  return jsonResponse({ ok: true }, 200)
})
