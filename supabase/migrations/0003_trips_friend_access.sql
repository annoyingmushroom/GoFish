-- Phase 3: Let friends read each other's trips (unlocks feed + leaderboard)
--
-- Run once in the Supabase SQL editor, after 0002_friendships.sql.
-- This only ADDS to the trips table; your existing "own trips" policy is
-- untouched. RLS policies combine with OR, so each user keeps full access to
-- their own trips AND gains read access to friends' shared trips.

-- visibility: 'friends' (shown in the feed/leaderboard to accepted friends)
--             'private' (only the owner can see it)
-- Existing trips default to 'friends' so they show up right away.
alter table public.trips
  add column if not exists visibility text not null default 'friends';

-- Denormalized total fish for this trip. Maintained by the app on insert/update
-- (fish are stored as free text like "Kingfish x2", which SQL can't sum), so
-- the leaderboard can rank by a plain integer instead of pulling every trip.
alter table public.trips
  add column if not exists fish_count int not null default 0;

-- The linchpin: a friend may READ a trip when it's shared and they're
-- confirmed friends with the owner. are_friends() (from 0002) runs as
-- security definer so it can check the friendship regardless of who queries.
create policy "friends read shared trips" on public.trips
  for select to authenticated
  using (visibility = 'friends' and public.are_friends(auth.uid(), user_id));
