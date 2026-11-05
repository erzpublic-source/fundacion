// Página pública de baja — el link de "Darte de baja" en los correos de
// invitación apunta directo aquí (GET, sin login). Marca el contacto como
// inactivo usando el token único de su fila y devuelve una página HTML de
// confirmación, en vez de un JSON — es para que alguien le dé clic desde
// su bandeja de entrada, no para que el frontend la llame por fetch.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

function page(title: string, message: string): Response {
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
  body { margin:0; font-family: 'Quicksand', Arial, sans-serif; background:#f6f3f8; padding:48px 16px; }
  .card { max-width:420px; margin:0 auto; background:#fff; border-radius:14px; overflow:hidden; border:1px solid #e4dfe9; text-align:center; }
  .header { background: linear-gradient(90deg,#6a5390 0%,#d4679a 100%); padding:22px 24px; color:#fff; font-weight:700; font-size:14px; }
  .body { padding:32px 24px; }
  h1 { margin:0 0 10px; font-size:19px; color:#221920; }
  p { margin:0; font-size:14px; line-height:1.55; color:#6b7280; }
</style>
</head>
<body>
  <div class="card">
    <div class="header">Fundación Un Día Más</div>
    <div class="body">
      <h1>${title}</h1>
      <p>${message}</p>
    </div>
  </div>
</body>
</html>`
  return new Response(html, { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'text/html; charset=utf-8' } })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY secret')
    return page('Algo salió mal', 'No pudimos procesar tu solicitud en este momento. Intenta de nuevo más tarde.')
  }

  const token = new URL(req.url).searchParams.get('token')
  if (!token) {
    return page('Enlace inválido', 'Este enlace de baja no es válido.')
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
    return page('Algo salió mal', 'No pudimos procesar tu solicitud en este momento. Intenta de nuevo más tarde.')
  }

  const updated = (await res.json()) as unknown[]
  if (updated.length === 0) {
    return page('Enlace inválido', 'Este enlace de baja no es válido o ya expiró.')
  }

  return page('Listo, te diste de baja', 'No volverás a recibir correos de invitación a eventos de la Fundación Un Día Más.')
})
