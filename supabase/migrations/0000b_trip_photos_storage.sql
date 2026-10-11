-- Phase 0b: Photo storage (first created in the Supabase dashboard)
--
-- Run once in the Supabase SQL editor, after 0000_trips.sql.
-- Trip photos and avatars live in one public bucket. Files are stored under
-- "<user id>/..." (see lib/images.ts), and uploads are only allowed into
-- your own folder.

-- ---------------------------------------------------------------------------
-- trip-photos: public bucket, so getPublicUrl() links work without auth
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('trip-photos', 'trip-photos', true)
  on conflict (id) do nothing;

-- Anyone can view photos (the bucket is public).
create policy "public photo read" on storage.objects
  for select
  using (bucket_id = 'trip-photos');

-- You can only upload into the folder named after your own user id.
create policy "upload own photos" on storage.objects
  for insert
  with check (
    bucket_id = 'trip-photos'
    and (auth.uid())::text = (storage.foldername(name))[1]
  );
