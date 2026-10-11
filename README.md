# GoFish

GoFish is a simple fishing trip log for keeping track of where you fished, what you caught, what bait or lure worked, and the photos worth remembering.

It is built to feel like a lightweight digital logbook: fast enough to use after a trip, organized enough to look back through later.

## What You Can Track

- Trip date and time
- Fishing location
- Fish species and quantity
- Bait or lure used
- Trip notes
- Photos from the trip

## Features

- Personal accounts
- Cloud-synced trip history
- Add, edit, and delete trips
- Fish species suggestions based on your past catches
- Bait/lure suggestions based on what you have used before
- Photo uploads with fullscreen viewing
- Stats for:
  - total trips
  - total fish caught
  - top species
  - top fishing spots
  - best bait
  - monthly catch activity
  - personal bests
- Profiles with avatars and usernames
- Friend requests (send, accept, decline, unfriend)
- Friends feed of shared trips, with per-trip private/friends visibility
- Leaderboard ranking you and your friends by fish caught

## Why GoFish

Fishing trips are easy to forget in the details: the tide, the spot, the bait, the little pattern that worked. GoFish gives you one place to keep those details so your log gets more useful the more you use it.

## Tech Stack

- **Frontend:** React Native + Expo (Expo Router), TypeScript, deployed as a web app on Vercel
- **Backend:** Supabase (Postgres, Auth, Storage)
- **Security:** Row-level security on every table; friends can only read trips shared with them, enforced in the database
- **Schema:** version-controlled SQL migrations in [`supabase/migrations/`](./supabase/migrations)

## Development

Setup, database and deployment notes live in [DEV_SETUP.md](./DEV_SETUP.md).
