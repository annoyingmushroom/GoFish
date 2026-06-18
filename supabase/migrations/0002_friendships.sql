-- Phase 2: Friendships (mutual friend graph)
--
-- Run once in the Supabase SQL editor, after 0001_profiles.sql.

-- ---------------------------------------------------------------------------
-- friendships: one row per relationship between two users.
-- requester sends the request; addressee accepts it. status flips to
-- 'accepted' once both are friends. Mutual model: a single accepted row
-- means the two users are friends in both directions.
-- ---------------------------------------------------------------------------
create table if not exists public.friendships (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references auth.users on delete cascade not null,
  addressee_id uuid references auth.users on delete cascade not null,
  status text not null default 'pending',          -- 'pending' | 'accepted'
  created_at timestamptz default now(),
  check (requester_id <> addressee_id)
);

-- At most one relationship per unordered pair (so A->B and B->A can't both exist).
create unique index if not exists friendships_pair_unique
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

alter table public.friendships enable row level security;

-- You can only see relationships you're part of.
create policy "see own friendships" on public.friendships
  for select to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- You can only send a request as yourself.
create policy "send friend requests" on public.friendships
  for insert to authenticated
  with check (auth.uid() = requester_id);

-- Either party can update (e.g. addressee accepts).
create policy "respond to friendships" on public.friendships
  for update to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id)
  with check (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Either party can remove (decline / cancel / unfriend).
create policy "remove friendships" on public.friendships
  for delete to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- ---------------------------------------------------------------------------
-- are_friends(a, b): true only when an accepted friendship links the two.
-- security definer so it can read the friendships table from inside RLS
-- policies on OTHER tables (e.g. trips), regardless of who is querying.
-- This is the helper Phase 3 uses to let friends read each other's trips.
-- ---------------------------------------------------------------------------
create or replace function public.are_friends(a uuid, b uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = a and f.addressee_id = b) or
        (f.requester_id = b and f.addressee_id = a)
      )
  );
$$;
