# GoFish Developer Setup

This document is for running, maintaining, and deploying the GoFish codebase.

## Tech Stack

- Expo
- React Native
- Expo Router
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- TypeScript

## Local Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

Run the web app locally:

```bash
npx expo start --web
```

Run with Expo for mobile testing:

```bash
npx expo start
```

## Supabase Setup

Create a Supabase project, then run this SQL in the Supabase SQL Editor:

```sql
create table if not exists public.trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date text default '',
  time text default '',
  location text default '',
  fish_got text default '',
  bait text default '',
  notes text default '',
  image_urls text[] default '{}',
  created_at timestamptz default now()
);

alter table public.trips enable row level security;

create policy "own trips"
  on public.trips for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
  values ('trip-photos', 'trip-photos', true)
  on conflict do nothing;

create policy "upload own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'trip-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "public photo read"
  on storage.objects for select
  using (bucket_id = 'trip-photos');
```

For easier local testing, disable email confirmation:

Supabase Dashboard -> Authentication -> Sign In / Providers -> Email -> Confirm email off.

## Useful Commands

Type-check:

```bash
npx tsc --noEmit
```

Lint:

```bash
npm run lint
```

Build static web output:

```bash
npx expo export --platform web
```

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import the repo into Vercel.
3. Set:

```text
Build Command: npx expo export --platform web
Output Directory: dist
```

4. Add these Vercel environment variables:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

5. Deploy.

After deployment, update Supabase Auth URL settings:

```text
Site URL: https://your-vercel-url.vercel.app
Redirect URLs: https://your-vercel-url.vercel.app/**
```

## Notes

- Trip dates are stored as ISO strings (`yyyy-mm-dd`) for reliable sorting.
- Older trip data is normalized on load where possible.
- Photos are compressed before upload.
- `.env` is ignored by Git and should never be committed.
