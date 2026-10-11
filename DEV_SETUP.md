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

Create a Supabase project, then run each file in `supabase/migrations/` in the Supabase SQL Editor, in filename order:

1. `0000_trips.sql` - trips table and owner-only RLS
2. `0000b_trip_photos_storage.sql` - public `trip-photos` bucket and upload policy
3. `0001_profiles.sql` - profiles, auto-created on sign-up
4. `0002_friendships.sql` - friend graph and `are_friends()` helper
5. `0003_trips_friend_access.sql` - trip visibility and friend read access
6. `0004_leaderboard.sql` - `get_leaderboard()` function
7. `0005_fix_friendship_rls.sql` - enforces the pending -> accepted request flow

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
