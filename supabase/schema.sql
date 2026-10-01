-- Fundación Un Día Más — esquema inicial (eventos + reservas)
-- Pega este script completo en Supabase → SQL Editor → New query → Run.
-- Seguro de ejecutar más de una vez (usa IF NOT EXISTS / OR REPLACE donde aplica).

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  event_date date,
  event_time time,
  place text not null default '',
  image_url text,
  kind text not null check (kind in ('gratis', 'pago', 'hibrido')),
  price integer,
  capacity integer not null default 0,
  published boolean not null default false,
  featured boolean not null default false,
  is_announcement boolean not null default false,
  sales_paused boolean not null default false,
  requires_registration boolean not null default true,
  created_at timestamptz not null default now()
);

-- A lo sumo un evento destacado a la vez.
create unique index if not exists events_single_featured
  on public.events (featured)
  where featured;

-- ---------------------------------------------------------------------------
-- discount_codes (hija de events)
-- ---------------------------------------------------------------------------
create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  code text not null,
  kind text not null check (kind in ('percent', 'fixed', 'free')),
  value integer not null default 0,
  max_uses integer not null default 0,
  used_count integer not null default 0,
  unique (event_id, code)
);

-- ---------------------------------------------------------------------------
-- reservations
-- ---------------------------------------------------------------------------
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  attendee_name text not null,
  email text not null,
  amount_paid integer not null default 0,
  status text not null default 'pendiente' check (status in ('pendiente', 'aprobado', 'rechazado')),
  ticket_code text,
  created_at timestamptz not null default now()
);

create index if not exists reservations_event_id_idx on public.reservations (event_id);

-- ---------------------------------------------------------------------------
-- reservedCount: vista con el conteo de reservas activas (no rechazadas) por evento
-- ---------------------------------------------------------------------------
create or replace view public.events_with_reserved_count as
select
  e.*,
  coalesce(r.reserved_count, 0) as reserved_count
from public.events e
left join (
  select event_id, count(*) as reserved_count
  from public.reservations
  where status <> 'rechazado'
  group by event_id
) r on r.event_id = e.id;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.discount_codes enable row level security;
alter table public.reservations enable row level security;

-- events: cualquiera puede LEER eventos publicados; solo un admin autenticado
-- puede leer TODO (incluye borradores) y escribir.
drop policy if exists "events_select_published" on public.events;
create policy "events_select_published" on public.events
  for select
  using (published = true or auth.role() = 'authenticated');

drop policy if exists "events_write_admin" on public.events;
create policy "events_write_admin" on public.events
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- discount_codes: solo el admin los ve y gestiona (el público nunca los lista,
-- solo los aplica por código vía una función/RPC más adelante).
drop policy if exists "discount_codes_admin_only" on public.discount_codes;
create policy "discount_codes_admin_only" on public.discount_codes
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- reservations: cualquiera puede CREAR una reserva (flujo público de /eventos);
-- solo el admin puede leer, aprobar o rechazar.
drop policy if exists "reservations_insert_public" on public.reservations;
create policy "reservations_insert_public" on public.reservations
  for insert
  with check (true);

drop policy if exists "reservations_select_admin" on public.reservations;
create policy "reservations_select_admin" on public.reservations
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "reservations_update_admin" on public.reservations;
create policy "reservations_update_admin" on public.reservations
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Storage: bucket público para imágenes de eventos
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

drop policy if exists "event_images_public_read" on storage.objects;
create policy "event_images_public_read" on storage.objects
  for select
  using (bucket_id = 'event-images');

drop policy if exists "event_images_admin_write" on storage.objects;
create policy "event_images_admin_write" on storage.objects
  for insert
  with check (bucket_id = 'event-images' and auth.role() = 'authenticated');
