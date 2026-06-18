-- Phase 5: Leaderboard
--
-- Run once in the Supabase SQL editor, after 0003_trips_friend_access.sql.
--
-- get_leaderboard ranks the caller plus their friends by total fish caught.
-- It is SECURITY INVOKER (the default), so it runs with the caller's
-- permissions and RLS on `trips` applies automatically: the function only
-- sees the caller's own trips + accepted friends' shared trips. That means
-- the GROUP BY naturally produces exactly the right set of people — no
-- manual friend filtering needed here.
--
-- `period` is accepted for a future "this month" toggle; the app calls it
-- with no argument, which defaults to all-time.
create or replace function public.get_leaderboard(period text default 'all')
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  fish_count bigint,
  trip_count bigint
)
language sql
stable
as $$
  select
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    coalesce(sum(t.fish_count), 0)::bigint as fish_count,
    count(t.id)::bigint as trip_count
  from public.trips t
  join public.profiles p on p.id = t.user_id
  where period <> 'month'
     or t.created_at >= date_trunc('month', now())
  group by p.id, p.username, p.display_name, p.avatar_url
  order by fish_count desc, trip_count desc;
$$;
