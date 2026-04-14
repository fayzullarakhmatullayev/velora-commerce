-- ─────────────────────────────────────────────────────────────────────────────
-- Velora Commerce — Storage Buckets
-- Run AFTER 002_rls_policies.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Products bucket (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products',
  'products',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Categories bucket (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'categories',
  'categories',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Avatars bucket (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- STORAGE POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

-- Products bucket: anyone can view
create policy "products_storage_select"
  on storage.objects for select
  using (bucket_id = 'products');

-- Products bucket: only admins can upload/delete
create policy "products_storage_insert_admin"
  on storage.objects for insert
  with check (bucket_id = 'products' and public.is_admin());

create policy "products_storage_update_admin"
  on storage.objects for update
  using (bucket_id = 'products' and public.is_admin());

create policy "products_storage_delete_admin"
  on storage.objects for delete
  using (bucket_id = 'products' and public.is_admin());

-- Avatars bucket: anyone can view
create policy "avatars_storage_select"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Avatars bucket: users can manage their own avatar
create policy "avatars_storage_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_storage_update_own"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_storage_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Categories bucket: anyone can view
create policy "categories_storage_select"
  on storage.objects for select
  using (bucket_id = 'categories');

-- Categories bucket: only admins can upload/delete
create policy "categories_storage_insert_admin"
  on storage.objects for insert
  with check (bucket_id = 'categories' and public.is_admin());

create policy "categories_storage_update_admin"
  on storage.objects for update
  using (bucket_id = 'categories' and public.is_admin());

create policy "categories_storage_delete_admin"
  on storage.objects for delete
  using (bucket_id = 'categories' and public.is_admin());
