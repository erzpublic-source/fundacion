// Endpoint público de baja — el link de "Darte de baja" en los correos de
// invitación apunta directo aquí (GET, sin login). Marca el contacto como
// inactivo usando el token único de su fila y luego REDIRIGE al navegador
// a /baja en el sitio real, que muestra la confirmación con el diseño de
// marca — Supabase fuerza content-type: text/plain + un CSP "sandbox" en
// cualquier respuesta HTML servida directo desde una Edge Function (para
// que no se puedan hospedar páginas completas bajo su dominio), así que
// intentar renderizar la confirmación aquí mismo no funciona.
//
// Secret nuevo que necesita este proyecto (Edge Functions → Secrets):
//   SITE_URL — la URL base del sitio a donde redirigir, sin barra final
//     (ej. https://fundacionundiamas.org o https://fundacion-dzu.pages.dev)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

function redirectTo(siteUrl: string, status: 'ok' | 'invalid' | 'error'): Response {
  return new Response(null, {
    status: 302,
    headers: { ...CORS_HEADERS, Location: `${siteUrl}/baja?status=${status}` },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const SITE_URL = Deno.env.get('SITE_URL')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SITE_URL) {
    console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or SITE_URL secret')
    // No SITE_URL means we can't even redirect — this is the one case that
    // has to fall back to a plain-text response.
    return new Response('Server misconfigured', { status: 500, headers: CORS_HEADERS })
  }

  const token = new URL(req.url).searchParams.get('token')
  if (!token) {
    return redirectTo(SITE_URL, 'invalid')
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/mailing_contacts?unsubscribe_token=eq.${encodeURIComponent(token)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ active: false, unsubscribed_at: new Date().toISOString() }),
    },
  )

  if (!res.ok) {
    console.error('Unsubscribe update failed:', res.status, await res.text())
    return redirectTo(SITE_URL, 'error')
  }

  const updated = (await res.json()) as unknown[]
  if (updated.length === 0) {
    return redirectTo(SITE_URL, 'invalid')
  }

  return redirectTo(SITE_URL, 'ok')
})
