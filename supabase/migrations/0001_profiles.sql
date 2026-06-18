-- Phase 1: Profiles (public identity layer for friends / feed / leaderboard)
--
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- Follows the same style as the existing trips/storage setup:
--   create table  ->  enable row level security  ->  create policy.

-- ---------------------------------------------------------------------------
-- profiles: one public row per auth user
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  display_name text default '',
  avatar_url text default '',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Any signed-in user can read every profile (so friends are findable/searchable).
create policy "profiles are readable" on public.profiles
  for select to authenticated using (true);

-- You can create your own profile row (id must be you).
create policy "insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- You can only edit your own profile.
create policy "update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user signs up.
-- security definer so the trigger can insert despite RLS.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any users that already exist.
insert into public.profiles (id)
  select id from auth.users on conflict do nothing;

-- Avatars reuse the existing public "trip-photos" bucket. Its upload policy
-- already allows writing to a folder named after your own user id, and the
-- "${userId}/..." path used by lib/images.ts satisfies it, so no storage
-- changes are needed for Phase 1.
