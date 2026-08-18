# Supabase backend

Fit Check stores the closet and outfit data in Supabase, under an anonymous
per-device account (no login screen — each install gets its own silent
Supabase user via `supabase.auth.signInAnonymously()`).

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and run `supabase/migrations/0001_init.sql`. It creates
   the `closet_items` and `outfits` tables (with row-level security scoped to
   `auth.uid()`) and a public-read `closet-photos` Storage bucket (writes are
   restricted to each user's own folder).
3. Go to **Authentication → Sign In / Up** and enable **"Allow anonymous
   sign-ins"**. This can't be set via SQL — it's a project-level toggle.
4. Copy `.env.example` to `.env` and fill in your project's URL and anon key
   from **Settings → API**.
5. (Optional) Sign up at [remove.bg/api](https://www.remove.bg/api) for a free
   API key (no card required, 50 cutouts/month) and set
   `EXPO_PUBLIC_REMOVEBG_API_KEY` in `.env`. This powers the "Cut out" button
   in the closet photo editor, which sends the photo to remove.bg and stores
   the transparent-background result instead of the original. Leave it blank
   to hide the feature.
6. Restart the dev server (`npx expo start`) so the new env vars load.

If any step is missed, the app shows what's wrong instead of crashing: a
"Connect Supabase" screen when `.env` isn't set, or a "Couldn't sign you in"
screen (with the exact Supabase error and a retry button) if anonymous
sign-ins aren't enabled yet.

## What's stored

- **`closet_items`** — one row per closet piece. `image_path` points at an
  object in the `closet-photos` bucket; items without a photo render a
  generated swatch instead (see `src/components/ClothingImage.tsx`).
- **`outfits`** — one row per saved outfit. `slots` is a jsonb array of
  `{ category, itemId }`, matching the app's in-memory `OutfitSlot[]` shape
  directly, so there's no separate join table.
- Both tables use `primary key (user_id, id)` rather than `id` alone,
  because every new anonymous account is seeded with the same sample-data
  ids (`top-1`, `outfit-1`, ...) — those only need to be unique per user, not
  globally.

## First run

The first time an account loads with an empty closet and no outfits, the app
seeds the built-in sample wardrobe automatically (`src/lib/seed.ts`). Profile
→ "Reset Sample Data" wipes and re-seeds an account at any time.

## Known limitation

The Supabase client in `src/lib/supabase.ts` is deliberately untyped (no
generated `Database` type param). The installed `@supabase/supabase-js` +
TypeScript 6 combination has a generic-inference bug where a typed client
collapses every `.insert()` / `.update()` payload to `never`. Row shapes are
still fully typed via `ClosetItemRow ` / `OutfitRow` in `supabase.ts` and
enforced at the mapper boundary (`src/lib/mappers.ts`) — only the raw
`.from(...)` query builder itself loses compile-time checking. Worth
revisiting if a future supabase-js release fixes it.
