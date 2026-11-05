-- Fase 2 de la base de contactos: bucket público para la imagen que el
-- admin adjunta a una invitación por correo (igual patrón que
-- event-images — admin sube, cualquiera puede leer, porque los clientes
-- de correo cargan la imagen desde una URL pública).
-- Pega este script en Supabase → SQL Editor → New query → Run.
-- Seguro de ejecutar más de una vez.

insert into storage.buckets (id, name, public)
values ('mailing-images', 'mailing-images', true)
on conflict (id) do nothing;

drop policy if exists "mailing_images_public_read" on storage.objects;
create policy "mailing_images_public_read" on storage.objects
  for select
  using (bucket_id = 'mailing-images');

drop policy if exists "mailing_images_admin_write" on storage.objects;
create policy "mailing_images_admin_write" on storage.objects
  for insert
  with check (bucket_id = 'mailing-images' and auth.role() = 'authenticated');
