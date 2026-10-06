-- Mensajes del formulario de Contacto.
-- Pega este script en Supabase → SQL Editor → New query → Run.
-- Seguro de ejecutar más de una vez (usa IF NOT EXISTS / OR REPLACE donde aplica).

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  correo text not null,
  asunto text not null,
  mensaje text not null,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Cualquiera puede ENVIAR un mensaje desde el formulario público; solo el
-- admin autenticado puede leerlos o marcarlos como leídos.
drop policy if exists "contact_messages_insert_public" on public.contact_messages;
create policy "contact_messages_insert_public" on public.contact_messages
  for insert
  with check (true);

drop policy if exists "contact_messages_select_admin" on public.contact_messages;
create policy "contact_messages_select_admin" on public.contact_messages
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "contact_messages_update_admin" on public.contact_messages;
create policy "contact_messages_update_admin" on public.contact_messages
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
