-- Base de contactos opt-in para enviar información de eventos/fundación
-- por correo. Igual que discount_codes: el público nunca lee esta tabla
-- directamente (RLS la deja solo para el admin autenticado); la escritura
-- pasa por submit-reservation (captura al reservar, con consentimiento
-- explícito) y por unsubscribe-contact (la baja vía link del correo).
-- Pega este script en Supabase → SQL Editor → New query → Run.
-- Seguro de ejecutar más de una vez.

create table if not exists public.mailing_contacts (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  correo text not null,
  whatsapp text,
  ciudad text,
  origen text,
  consent_at timestamptz not null default now(),
  active boolean not null default true,
  unsubscribed_at timestamptz,
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unique (correo)
);

create index if not exists mailing_contacts_unsubscribe_token_idx on public.mailing_contacts (unsubscribe_token);

alter table public.mailing_contacts enable row level security;

drop policy if exists "mailing_contacts_admin_only" on public.mailing_contacts;
create policy "mailing_contacts_admin_only" on public.mailing_contacts
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
