-- Phase 6: Tighten friendship RLS
--
-- Run once in the Supabase SQL editor, after 0004_leaderboard.sql.
--
-- The policies in 0002 trusted the client: a user could insert a row that was
-- already 'accepted', accept their own outgoing request, or update a row to
-- point at a different user. Any of these would make them "friends" with
-- someone without consent and expose that person's shared trips.
-- These policies make the database enforce the request flow:
--   pending (sent by requester)  ->  accepted (by addressee only)

-- New requests must start as pending.
drop policy "send friend requests" on public.friendships;
create policy "send friend requests" on public.friendships
  for insert to authenticated
  with check (auth.uid() = requester_id and status = 'pending');

-- Only the addressee can accept, and only a pending request.
drop policy "respond to friendships" on public.friendships;
create policy "accept friend requests" on public.friendships
  for update to authenticated
  using (auth.uid() = addressee_id and status = 'pending')
  with check (auth.uid() = addressee_id and status = 'accepted');

-- RLS checks rows, not columns, so also restrict UPDATE to the status column.
-- This stops either user swapping requester_id / addressee_id.
revoke update on public.friendships from authenticated;
grant update (status) on public.friendships to authenticated;
