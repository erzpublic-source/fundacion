-- Postulaciones del formulario de Voluntariado.
-- Pega este script en Supabase → SQL Editor → New query → Run.
-- Seguro de ejecutar más de una vez (usa IF NOT EXISTS / OR REPLACE donde aplica).

create table if not exists public.volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  especialidad text not null,
  ciudad text not null,
  celular text not null,
  correo text not null,
  cv_url text not null,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.volunteer_applications enable row level security;

-- Cualquiera puede POSTULARSE desde el formulario público; solo el admin
-- autenticado puede leer las postulaciones o marcarlas como leídas.
drop policy if exists "volunteer_applications_insert_public" on public.volunteer_applications;
create policy "volunteer_applications_insert_public" on public.volunteer_applications
  for insert
  with check (true);

drop policy if exists "volunteer_applications_select_admin" on public.volunteer_applications;
create policy "volunteer_applications_select_admin" on public.volunteer_applications
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "volunteer_applications_update_admin" on public.volunteer_applications;
create policy "volunteer_applications_update_admin" on public.volunteer_applications
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Storage: bucket privado para las hojas de vida (PDF)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('volunteer-cvs', 'volunteer-cvs', false)
on conflict (id) do nothing;

drop policy if exists "volunteer_cvs_public_upload" on storage.objects;
create policy "volunteer_cvs_public_upload" on storage.objects
  for insert
  with check (bucket_id = 'volunteer-cvs');

drop policy if exists "volunteer_cvs_admin_read" on storage.objects;
create policy "volunteer_cvs_admin_read" on storage.objects
  for select
  using (bucket_id = 'volunteer-cvs' and auth.role() = 'authenticated');
