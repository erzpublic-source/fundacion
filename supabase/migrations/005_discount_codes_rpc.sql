-- Conecta los códigos de descuento reales (tabla discount_codes) al formulario
-- público de reservas. Hasta ahora ReservationDrawer.tsx solo reconocía dos
-- códigos de ejemplo escritos a mano en el frontend — esto los reemplaza por
-- datos reales, sin exponer la tabla completa al público (discount_codes
-- sigue siendo solo para el admin vía RLS; estas funciones son el único
-- camino que tiene el público para consultarla, y solo devuelven lo mínimo).
-- Pega este script en Supabase → SQL Editor → New query → Run.
-- Seguro de ejecutar más de una vez.

-- Guarda qué código (si alguno) se aplicó a cada reserva, para poder
-- mostrarlo luego en el correo de confirmación de entrada.
alter table public.reservations add column if not exists discount_code text;

-- Valida un código para un evento sin consumir un uso todavía — se llama
-- cuando el comprador le da "Aplicar" en el formulario.
create or replace function public.validate_discount_code(p_event_id uuid, p_code text)
returns table (kind text, value integer)
language sql
security definer
set search_path = public
as $$
  select kind, value
  from public.discount_codes
  where event_id = p_event_id
    and code = upper(trim(p_code))
    and (max_uses = 0 or used_count < max_uses)
$$;

grant execute on function public.validate_discount_code(uuid, text) to anon, authenticated;

-- Consume un uso del código de forma atómica — se llama justo cuando se
-- envía la reserva, no solo al validarlo (evita que alguien "reserve" el
-- cupo del código sin llegar a enviar el formulario).
create or replace function public.redeem_discount_code(p_event_id uuid, p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated integer;
begin
  update public.discount_codes
  set used_count = used_count + 1
  where event_id = p_event_id
    and code = upper(trim(p_code))
    and (max_uses = 0 or used_count < max_uses);
  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;

grant execute on function public.redeem_discount_code(uuid, text) to anon, authenticated;
