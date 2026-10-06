// reCAPTCHA v2 ("No soy un robot" checkbox), shared by Contacto, Voluntariado
// and the event reservation drawer.
//
// This is the SITE key, not the secret key — it's designed to be public and
// safe to ship in client-side code (Google's own docs embed it directly in
// HTML). The secret key is never used here: verifying it server-side would
// need a backend function, which this static site doesn't have yet. Without
// that, this stops generic bots that fill out every form they find, but
// doesn't stop a determined attacker calling the Supabase API directly.
//
// reCAPTCHA keys are registered per domain, and staging/production use
// separate sites in the Google console, so the key comes from the build's
// env var — falling back to the production key for local dev.
export const RECAPTCHA_SITE_KEY =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LfYEuEtAAAAAN5l6MHuWNzKV26i3Po52RlkDoKP'
