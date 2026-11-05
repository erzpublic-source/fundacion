-- Control físico de ingreso: el admin marca manualmente, en la puerta del
-- evento, qué reservas aprobadas sí se presentaron.
-- Pega este script en Supabase → SQL Editor → New query → Run.
-- Seguro de ejecutar más de una vez.

alter table public.reservations add column if not exists checked_in boolean not null default false;
alter table public.reservations add column if not exists checked_in_at timestamptz;
