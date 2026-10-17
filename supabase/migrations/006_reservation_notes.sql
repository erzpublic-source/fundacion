-- Guarda el motivo de rechazo elegido por el admin, para mostrarlo en el
-- correo que recibe el comprador cuando su reserva es rechazada.
-- Pega este script en Supabase → SQL Editor → New query → Run.
-- Seguro de ejecutar más de una vez.

alter table public.reservations add column if not exists rejection_reason text;
