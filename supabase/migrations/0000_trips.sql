-- Phase 0: Trips (the original table, first created in the Supabase dashboard)
--
-- Run once in the Supabase SQL editor, before 0001_profiles.sql.
-- visibility and fish_count are added later by 0003_trips_friend_access.sql.

-- ---------------------------------------------------------------------------
-- trips: one row per fishing trip, owned by a single user
-- ---------------------------------------------------------------------------
create table if not exists public.trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date text default '',
  time text default '',
  location text default '',
  fish_got text default '',          -- free text, e.g. "Kingfish x2, Tilapia x1"
  bait text default '',
  notes text default '',
  image_urls text[] default '{}',    -- public URLs in the trip-photos bucket
  created_at timestamptz default now()
);

alter table public.trips enable row level security;

-- You can read, add, edit and delete only your own trips.
create policy "own trips" on public.trips
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
