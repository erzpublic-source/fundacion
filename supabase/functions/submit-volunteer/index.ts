// Recibe el formulario de Voluntariado y verifica el token de reCAPTCHA
// contra la API de Google ANTES de insertar la postulación. El PDF de la
// hoja de vida sigue subiéndose directo desde el navegador al bucket
// privado (eso ya está protegido por su propia política de Storage); esta
// función solo gatekeepea la fila que hace visible la postulación al admin.
//
// Secret nuevo que necesita este proyecto (Edge Functions → Secrets):
//   RECAPTCHA_SECRET_KEY — la "Secret key" del sitio en
//     https://www.google.com/recaptcha/admin (NO la site key pública que
//     ya está en el frontend)

interface RequestBody {
  nombre: string
  especialidad: string
  ciudad: string
  celular: string
  correo: string
  cvUrl: string
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

  const { nombre, especialidad, ciudad, celular, correo, cvUrl, recaptchaToken } = body
  if (
    !nombre?.trim() ||
    !especialidad?.trim() ||
    !ciudad?.trim() ||
    !celular?.trim() ||
    !correo?.trim() ||
    !cvUrl?.trim() ||
    !recaptchaToken
  ) {
    return jsonResponse({ error: 'missing_fields' }, 400)
  }

  const captchaOk = await verifyRecaptcha(RECAPTCHA_SECRET_KEY, recaptchaToken)
  if (!captchaOk) {
    return jsonResponse({ error: 'captcha_failed' }, 400)
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/volunteer_applications`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      nombre: nombre.trim(),
      especialidad: especialidad.trim(),
      ciudad: ciudad.trim(),
      celular: celular.trim(),
      correo: correo.trim(),
      cv_url: cvUrl.trim(),
    }),
  })

  if (!res.ok) {
    console.error('Insert error:', res.status, await res.text())
    return jsonResponse({ error: 'insert_failed' }, 502)
  }

  return jsonResponse({ ok: true }, 200)
})
