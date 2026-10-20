-- Cierra el hueco de seguridad detectado por Google reCAPTCHA: el checkbox
-- solo se validaba en el navegador, nunca contra la API de Google — así
-- que cualquiera podía saltárselo y escribir directo a estas tablas. Desde
-- ahora, Contacto, Voluntariado y Reserva de eventos insertan sus filas a
-- través de una Edge Function (submit-contact / submit-volunteer /
-- submit-reservation) que verifica el token con Google antes de escribir,
-- así que el insert público directo ya no hace falta.
-- Pega este script en Supabase → SQL Editor → New query → Run.
-- Seguro de ejecutar más de una vez.

drop policy if exists "contact_messages_insert_public" on public.contact_messages;
drop policy if exists "volunteer_applications_insert_public" on public.volunteer_applications;
drop policy if exists "reservations_insert_public" on public.reservations;

-- El cliente ya no llama redeem_discount_code directamente — ahora lo hace
-- submit-reservation (con la service role key, que no necesita este grant,
-- pero quitamos el acceso anónimo de todas formas).
revoke execute on function public.redeem_discount_code(uuid, text) from anon;
