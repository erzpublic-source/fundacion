-- Agrega soporte para el comprobante de pago real de cada reserva.
-- Pega este script en Supabase → SQL Editor → New query → Run.
-- Seguro de ejecutar más de una vez.

alter table public.reservations add column if not exists receipt_url text;

-- Bucket PRIVADO (a diferencia de event-images): un comprobante de pago es
-- información sensible, solo el admin autenticado debe poder verlo.
insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', false)
on conflict (id) do nothing;

-- El comprador (anónimo) puede subir su comprobante al reservar...
drop policy if exists "payment_receipts_insert_public" on storage.objects;
create policy "payment_receipts_insert_public" on storage.objects
  for insert
  with check (bucket_id = 'payment-receipts');

-- ...pero solo el admin autenticado puede leerlo de vuelta.
drop policy if exists "payment_receipts_select_admin" on storage.objects;
create policy "payment_receipts_select_admin" on storage.objects
  for select
  using (bucket_id = 'payment-receipts' and auth.role() = 'authenticated');
